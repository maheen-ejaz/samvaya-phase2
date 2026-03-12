import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from './types';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

let client: Anthropic | null = null;

export function getClient(): Anthropic {
  if (!client) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY environment variable is not set');
    }
    client = new Anthropic({ apiKey });
  }
  return client;
}

/**
 * Send a chat message to Claude and get the assistant's response.
 * Used for the conversational flow (Q38, Q75, Q100).
 */
export async function sendChatMessage(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from Claude');
  }
  return textBlock.text;
}

/**
 * Run extraction on a completed conversation transcript.
 * Uses temperature 0 for consistent structured output.
 */
export async function extractFromTranscript(
  extractionPrompt: string,
  transcript: string
): Promise<Record<string, unknown>> {
  const anthropic = getClient();

  const response = await anthropic.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: 2048,
    temperature: 0,
    system: extractionPrompt,
    messages: [
      {
        role: 'user',
        content: transcript,
      },
    ],
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  if (!textBlock || textBlock.type !== 'text') {
    throw new Error('No text response from extraction');
  }

  // Parse JSON from response — Claude may wrap it in markdown code blocks
  // Find the outermost balanced JSON object (handles nested braces correctly)
  const text = textBlock.text;
  const start = text.indexOf('{');
  if (start === -1) {
    throw new Error('No JSON found in extraction response');
  }
  let depth = 0;
  let end = -1;
  for (let i = start; i < text.length; i++) {
    if (text[i] === '{') depth++;
    else if (text[i] === '}') {
      depth--;
      if (depth === 0) { end = i + 1; break; }
    }
  }
  if (end === -1) {
    throw new Error('Unbalanced JSON in extraction response');
  }
  return JSON.parse(text.slice(start, end));
}
