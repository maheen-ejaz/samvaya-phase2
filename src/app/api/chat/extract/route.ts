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
    // Extract the user's single response from the transcript (handles multi-line messages)
    const userIndex = transcript.lastIndexOf('User: ');
    const freeformNote = userIndex !== -1
      ? transcript.slice(userIndex + 6).trim()
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

  // Q75 extraction not yet implemented — save transcript only (Day 11)
  if (chatId === 'Q75') {
    const { data: existing } = await supabase
      .from('compatibility_profiles')
      .select('raw_conversation_transcript')
      .eq('user_id', user.id)
      .maybeSingle();

    const sectionLabel = '[SECTION J — Goals & Values]';
    const existingTranscript = existing?.raw_conversation_transcript || '';
    const rawTranscript = existingTranscript
      ? `${existingTranscript}\n\n${sectionLabel}\n${transcript}`
      : `${sectionLabel}\n${transcript}`;

    await supabase
      .from('compatibility_profiles')
      .update({ raw_conversation_transcript: rawTranscript } as never)
      .eq('user_id', user.id);

    return NextResponse.json({ success: true, extracted: null });
  }

  // Run extraction via Claude
  let extracted: Record<string, unknown>;
  try {
    extracted = await extractFromTranscript(config.extractionPrompt, transcript);
  } catch (err) {
    console.error('Extraction error:', err);
    return NextResponse.json(
      { error: 'Extraction failed. Transcript saved; extraction can be re-run.' },
      { status: 502 }
    );
  }

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
    const { data: existing } = await supabase
      .from('compatibility_profiles')
      .select('raw_conversation_transcript')
      .eq('user_id', user.id)
      .maybeSingle();

    const sectionLabel = '[SECTION D — Family Background]';
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
