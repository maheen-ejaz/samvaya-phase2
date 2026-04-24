import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractFromTranscript } from '@/lib/claude/client';
import { getChatConfig } from '@/lib/claude/prompts';
import { checkRateLimit } from '@/lib/rate-limit';

export const maxDuration = 60;
import type { ExtractionRequest } from '@/lib/claude/types';

// Defense against prompt injection: an attacker can coax Claude into producing
// arbitrary JSON by injecting instructions into their chat messages. We never
// trust the shape, type, or range of extracted values — validate everything
// before writing to compatibility_profiles.
const COMMUNICATION_STYLE = ['direct', 'indirect', 'avoidant', 'expressive', 'reserved'] as const;
const CONFLICT_APPROACH = ['addresses_immediately', 'reflects_first', 'withdraws', 'collaborative'] as const;
const PARTNER_ROLE_VISION = ['co_builder', 'anchor_complement', 'flexible'] as const;
const FINANCIAL_VALUES = ['financially_intentional', 'financially_casual', 'financially_anxious', 'not_discussed'] as const;

const NOTE_MAX_LEN = 500;
const SUMMARY_MAX_LEN = 2000;
const KEYWORD_MAX_LEN = 60;
const KEYWORDS_MAX_COUNT = 20;

function validScore(v: unknown): number | undefined {
  if (typeof v !== 'number' || !Number.isFinite(v)) return undefined;
  const rounded = Math.round(v);
  if (rounded < 0 || rounded > 100) return undefined;
  return rounded;
}

function validNote(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, NOTE_MAX_LEN);
}

function validSummary(v: unknown): string | undefined {
  if (typeof v !== 'string') return undefined;
  const trimmed = v.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, SUMMARY_MAX_LEN);
}

function validEnum<T extends string>(v: unknown, allow: readonly T[]): T | undefined {
  return typeof v === 'string' && (allow as readonly string[]).includes(v) ? (v as T) : undefined;
}

function validKeywords(v: unknown): string[] | undefined {
  if (!Array.isArray(v)) return undefined;
  const cleaned = v
    .filter((item): item is string => typeof item === 'string')
    .map((s) => s.trim().slice(0, KEYWORD_MAX_LEN))
    .filter(Boolean)
    .slice(0, KEYWORDS_MAX_COUNT);
  return cleaned.length ? cleaned : undefined;
}

interface SanitizedExtraction {
  family_orientation_score?: number;
  family_orientation_notes?: string;
  traditionalism_score?: number;
  traditionalism_notes?: string;
  independence_vs_togetherness_score?: number;
  independence_vs_togetherness_notes?: string;
  career_ambition_score?: number;
  career_ambition_notes?: string;
  emotional_expressiveness_score?: number;
  emotional_expressiveness_notes?: string;
  social_orientation_score?: number;
  social_orientation_notes?: string;
  relocation_openness_score?: number;
  relocation_openness_notes?: string;
  life_pace_score?: number;
  life_pace_notes?: string;
  communication_style?: typeof COMMUNICATION_STYLE[number];
  conflict_approach?: typeof CONFLICT_APPROACH[number];
  partner_role_vision?: typeof PARTNER_ROLE_VISION[number];
  financial_values?: typeof FINANCIAL_VALUES[number];
  ai_personality_summary?: string;
  ai_compatibility_keywords?: string[];
  key_quote?: string;
  ai_red_flags?: string;
}

function sanitizeExtraction(raw: Record<string, unknown>): SanitizedExtraction {
  const s: SanitizedExtraction = {};
  const scored = [
    'family_orientation',
    'traditionalism',
    'independence_vs_togetherness',
    'career_ambition',
    'emotional_expressiveness',
    'social_orientation',
    'relocation_openness',
    'life_pace',
  ] as const;
  for (const key of scored) {
    const score = validScore(raw[`${key}_score`]);
    if (score !== undefined) {
      (s as Record<string, unknown>)[`${key}_score`] = score;
      const notes = validNote(raw[`${key}_notes`]);
      if (notes) (s as Record<string, unknown>)[`${key}_notes`] = notes;
    }
  }
  const comm = validEnum(raw.communication_style, COMMUNICATION_STYLE);
  if (comm) s.communication_style = comm;
  const conflict = validEnum(raw.conflict_approach, CONFLICT_APPROACH);
  if (conflict) s.conflict_approach = conflict;
  const role = validEnum(raw.partner_role_vision, PARTNER_ROLE_VISION);
  if (role) s.partner_role_vision = role;
  const fin = validEnum(raw.financial_values, FINANCIAL_VALUES);
  if (fin) s.financial_values = fin;
  const summary = validSummary(raw.ai_personality_summary);
  if (summary) s.ai_personality_summary = summary;
  const keywords = validKeywords(raw.ai_compatibility_keywords);
  if (keywords) s.ai_compatibility_keywords = keywords;
  const quote = validNote(raw.key_quote);
  if (quote) s.key_quote = quote;
  const redFlags = validSummary(raw.ai_red_flags);
  if (redFlags) s.ai_red_flags = redFlags;
  return s;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Rate limit: 20 extractions per hour per user
  const { allowed } = await checkRateLimit(`extract:${user.id}`, 20, 3600_000);
  if (!allowed) {
    return NextResponse.json({ error: 'Too many extraction attempts. Please try again later.' }, { status: 429 });
  }

  let body: ExtractionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { chatId, transcript } = body;

  const VALID_CHAT_IDS = ['Q38', 'Q75', 'Q100'] as const;

  if (!chatId || !transcript) {
    return NextResponse.json({ error: 'Missing chatId or transcript' }, { status: 400 });
  }

  if (!VALID_CHAT_IDS.includes(chatId as typeof VALID_CHAT_IDS[number])) {
    return NextResponse.json({ error: 'Invalid chatId' }, { status: 400 });
  }

  if (transcript.length > 100_000) {
    return NextResponse.json({ error: 'Transcript exceeds 100,000 character limit' }, { status: 400 });
  }

  const config = getChatConfig(chatId);

  // Q100 has no extraction — store verbatim
  if (chatId === 'Q100') {
    // Extract the user's single response from the transcript
    // Look for "User: " at the start of a line to avoid matching within message content
    const lines = transcript.split('\n');
    let userStartLine = -1;
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].startsWith('User: ')) {
        userStartLine = i;
        break;
      }
    }
    const freeformNote = userStartLine !== -1
      ? [lines[userStartLine].slice(6), ...lines.slice(userStartLine + 1)].join('\n').trim()
      : transcript;

    await supabase
      .from('compatibility_profiles')
      .update({
        closing_freeform_note: freeformNote,
        conversation_completed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id);

    return NextResponse.json({ success: true });
  }

  // Run extraction via Claude (Q38 and Q75)
  let rawExtracted: Record<string, unknown>;
  try {
    rawExtracted = await extractFromTranscript(config.extractionPrompt, transcript);
  } catch (err) {
    console.error('Extraction error:', err);

    // On failure, still save the transcript so it can be re-extracted later
    const { data: fallback } = await supabase
      .from('compatibility_profiles')
      .select('raw_conversation_transcript')
      .eq('user_id', user.id)
      .maybeSingle();

    const sectionLabel = chatId === 'Q38'
      ? '[SECTION D — Family Background]'
      : '[SECTION J — Goals & Values]';
    const fallbackTranscript = fallback?.raw_conversation_transcript || '';
    const rawTranscript = fallbackTranscript
      ? `${fallbackTranscript}\n\n${sectionLabel}\n${transcript}`
      : `${sectionLabel}\n${transcript}`;

    await supabase
      .from('compatibility_profiles')
      .update({ raw_conversation_transcript: rawTranscript } as never)
      .eq('user_id', user.id);

    return NextResponse.json(
      { error: 'Extraction failed. Transcript saved; extraction can be re-run.' },
      { status: 502 }
    );
  }

  const extracted = sanitizeExtraction(rawExtracted);

  // Fetch existing compatibility profile data (needed by both Q38 and Q75)
  const { data: existing } = await supabase
    .from('compatibility_profiles')
    .select('raw_conversation_transcript, independence_vs_togetherness_score, independence_vs_togetherness_notes, key_quote')
    .eq('user_id', user.id)
    .maybeSingle();

  // Build the update payload based on chatId
  const updatePayload: Record<string, unknown> = {
    extraction_model_version: 'claude-sonnet-4-20250514 / prompt-v0.1',
  };

  if (chatId === 'Q38') {
    // Conv 1 — family background dimensions
    if (extracted.family_orientation_score !== undefined) {
      updatePayload.family_orientation_score = extracted.family_orientation_score;
      if (extracted.family_orientation_notes) updatePayload.family_orientation_notes = extracted.family_orientation_notes;
    }
    if (extracted.traditionalism_score !== undefined) {
      updatePayload.traditionalism_score = extracted.traditionalism_score;
      if (extracted.traditionalism_notes) updatePayload.traditionalism_notes = extracted.traditionalism_notes;
    }
    if (extracted.independence_vs_togetherness_score !== undefined) {
      updatePayload.independence_vs_togetherness_score = extracted.independence_vs_togetherness_score;
      if (extracted.independence_vs_togetherness_notes) updatePayload.independence_vs_togetherness_notes = extracted.independence_vs_togetherness_notes;
    }
    if (extracted.key_quote !== undefined) {
      updatePayload.key_quote = extracted.key_quote;
    }

    // Append Conv 1 transcript with section label
    const sectionLabel = '[SECTION D — Family Background]';
    const existingTranscript = existing?.raw_conversation_transcript || '';
    updatePayload.raw_conversation_transcript = existingTranscript
      ? `${existingTranscript}\n\n${sectionLabel}\n${transcript}`
      : `${sectionLabel}\n${transcript}`;

    updatePayload.conversation_completed_at = new Date().toISOString();
  } else if (chatId === 'Q75') {
    // Conv 2 — goals & values dimensions (6 scored + 4 enum + summaries)

    // Scored dimensions (direct mapping) — values sanitized by sanitizeExtraction
    if (extracted.career_ambition_score !== undefined) {
      updatePayload.career_ambition_score = extracted.career_ambition_score;
      if (extracted.career_ambition_notes) updatePayload.career_ambition_notes = extracted.career_ambition_notes;
    }
    if (extracted.emotional_expressiveness_score !== undefined) {
      updatePayload.emotional_expressiveness_score = extracted.emotional_expressiveness_score;
      if (extracted.emotional_expressiveness_notes) updatePayload.emotional_expressiveness_notes = extracted.emotional_expressiveness_notes;
    }
    if (extracted.social_orientation_score !== undefined) {
      updatePayload.social_orientation_score = extracted.social_orientation_score;
      if (extracted.social_orientation_notes) updatePayload.social_orientation_notes = extracted.social_orientation_notes;
    }
    if (extracted.relocation_openness_score !== undefined) {
      updatePayload.relocation_openness_score = extracted.relocation_openness_score;
      if (extracted.relocation_openness_notes) updatePayload.relocation_openness_notes = extracted.relocation_openness_notes;
    }
    if (extracted.life_pace_score !== undefined) {
      updatePayload.life_pace_score = extracted.life_pace_score;
      if (extracted.life_pace_notes) updatePayload.life_pace_notes = extracted.life_pace_notes;
    }

    // Special: independence_vs_togetherness — average with Conv 1 score
    if (extracted.independence_vs_togetherness_score !== undefined) {
      const conv1Score = existing?.independence_vs_togetherness_score;
      const conv1Notes = existing?.independence_vs_togetherness_notes;

      if (conv1Score !== null && conv1Score !== undefined) {
        updatePayload.independence_vs_togetherness_score =
          Math.round((conv1Score + extracted.independence_vs_togetherness_score) / 2);
        updatePayload.independence_vs_togetherness_notes =
          `Conv 1: ${conv1Notes || 'no notes'} | Conv 2: ${extracted.independence_vs_togetherness_notes || 'no notes'}`;
      } else {
        updatePayload.independence_vs_togetherness_score = extracted.independence_vs_togetherness_score;
        if (extracted.independence_vs_togetherness_notes) updatePayload.independence_vs_togetherness_notes = extracted.independence_vs_togetherness_notes;
      }
    }

    // Enum fields — allowlist-validated in sanitizeExtraction
    if (extracted.communication_style) updatePayload.communication_style = extracted.communication_style;
    if (extracted.conflict_approach) updatePayload.conflict_approach = extracted.conflict_approach;
    if (extracted.partner_role_vision) updatePayload.partner_role_vision = extracted.partner_role_vision;
    if (extracted.financial_values) updatePayload.financial_values = extracted.financial_values;

    // Summary fields — length-capped in sanitizeExtraction
    if (extracted.ai_personality_summary) updatePayload.ai_personality_summary = extracted.ai_personality_summary;
    if (extracted.ai_compatibility_keywords) updatePayload.ai_compatibility_keywords = extracted.ai_compatibility_keywords;
    if (extracted.ai_red_flags) updatePayload.ai_red_flags = extracted.ai_red_flags;

    // Special: key_quote — only update if Conv 1 didn't already produce one
    if (extracted.key_quote && !existing?.key_quote) {
      updatePayload.key_quote = extracted.key_quote;
    }

    // Append Conv 2 transcript with section label
    const sectionLabel = '[SECTION J — Goals & Values]';
    const existingTranscript = existing?.raw_conversation_transcript || '';
    updatePayload.raw_conversation_transcript = existingTranscript
      ? `${existingTranscript}\n\n${sectionLabel}\n${transcript}`
      : `${sectionLabel}\n${transcript}`;

    updatePayload.conversation_completed_at = new Date().toISOString();
  }

  await supabase
    .from('compatibility_profiles')
    .update(updatePayload as never)
    .eq('user_id', user.id);

  return NextResponse.json({ success: true });
}
