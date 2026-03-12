import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { extractFromTranscript } from '@/lib/claude/client';
import { getChatConfig } from '@/lib/claude/prompts';
import type { ExtractionRequest } from '@/lib/claude/types';

export async function POST(request: NextRequest) {
  const supabase = await createClient();

  // Authenticate
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: ExtractionRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { chatId, transcript } = body;

  if (!chatId || !transcript) {
    return NextResponse.json({ error: 'Missing chatId or transcript' }, { status: 400 });
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
  let extracted: Record<string, unknown>;
  try {
    extracted = await extractFromTranscript(config.extractionPrompt, transcript);
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
      updatePayload.family_orientation_notes = extracted.family_orientation_notes;
    }
    if (extracted.traditionalism_score !== undefined) {
      updatePayload.traditionalism_score = extracted.traditionalism_score;
      updatePayload.traditionalism_notes = extracted.traditionalism_notes;
    }
    if (extracted.independence_vs_togetherness_score !== undefined) {
      updatePayload.independence_vs_togetherness_score = extracted.independence_vs_togetherness_score;
      updatePayload.independence_vs_togetherness_notes = extracted.independence_vs_togetherness_notes;
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

    // Scored dimensions (direct mapping)
    if (extracted.career_ambition_score !== undefined) {
      updatePayload.career_ambition_score = extracted.career_ambition_score;
      updatePayload.career_ambition_notes = extracted.career_ambition_notes;
    }
    if (extracted.emotional_expressiveness_score !== undefined) {
      updatePayload.emotional_expressiveness_score = extracted.emotional_expressiveness_score;
      updatePayload.emotional_expressiveness_notes = extracted.emotional_expressiveness_notes;
    }
    if (extracted.social_orientation_score !== undefined) {
      updatePayload.social_orientation_score = extracted.social_orientation_score;
      updatePayload.social_orientation_notes = extracted.social_orientation_notes;
    }
    if (extracted.relocation_openness_score !== undefined) {
      updatePayload.relocation_openness_score = extracted.relocation_openness_score;
      updatePayload.relocation_openness_notes = extracted.relocation_openness_notes;
    }
    if (extracted.life_pace_score !== undefined) {
      updatePayload.life_pace_score = extracted.life_pace_score;
      updatePayload.life_pace_notes = extracted.life_pace_notes;
    }

    // Special: independence_vs_togetherness — average with Conv 1 score
    if (extracted.independence_vs_togetherness_score !== undefined) {
      const conv1Score = existing?.independence_vs_togetherness_score;
      const conv1Notes = existing?.independence_vs_togetherness_notes;

      if (conv1Score !== null && conv1Score !== undefined) {
        updatePayload.independence_vs_togetherness_score =
          Math.round((conv1Score + Number(extracted.independence_vs_togetherness_score)) / 2);
        updatePayload.independence_vs_togetherness_notes =
          `Conv 1: ${conv1Notes || 'no notes'} | Conv 2: ${extracted.independence_vs_togetherness_notes || 'no notes'}`;
      } else {
        updatePayload.independence_vs_togetherness_score = extracted.independence_vs_togetherness_score;
        updatePayload.independence_vs_togetherness_notes = extracted.independence_vs_togetherness_notes;
      }
    }

    // Enum fields (DB constraints validate values)
    if (extracted.communication_style) {
      updatePayload.communication_style = extracted.communication_style;
    }
    if (extracted.conflict_approach) {
      updatePayload.conflict_approach = extracted.conflict_approach;
    }
    if (extracted.partner_role_vision) {
      updatePayload.partner_role_vision = extracted.partner_role_vision;
    }
    if (extracted.financial_values) {
      updatePayload.financial_values = extracted.financial_values;
    }

    // Summary fields
    if (extracted.ai_personality_summary) {
      updatePayload.ai_personality_summary = extracted.ai_personality_summary;
    }
    if (extracted.ai_compatibility_keywords) {
      updatePayload.ai_compatibility_keywords = extracted.ai_compatibility_keywords;
    }
    if (extracted.ai_red_flags !== undefined) {
      updatePayload.ai_red_flags = extracted.ai_red_flags;
    }

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

  return NextResponse.json({ success: true, extracted });
}
