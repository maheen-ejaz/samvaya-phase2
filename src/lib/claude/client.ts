import Anthropic from '@anthropic-ai/sdk';
import type { ChatMessage } from './types';

const CLAUDE_MODEL = 'claude-sonnet-4-20250514';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
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
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('No JSON found in extraction response');
  }
  return JSON.parse(jsonMatch[0]);
}
