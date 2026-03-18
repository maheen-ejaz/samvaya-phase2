/**
 * Client-safe chat metadata — no system prompts or extraction logic.
 * Used by ChatInterface to display titles, exchange limits, and nudge text.
 * The actual prompts remain in prompts.ts (server-only).
 */

export interface ChatMetadata {
  chatId: 'Q38' | 'Q75' | 'Q100';
  maxExchanges: number;
  title: string;
  nudgeText: string;
}

export const CHAT_METADATA: Record<string, ChatMetadata> = {
  Q38: {
    chatId: 'Q38',
    maxExchanges: 4,
    title: 'Family Background',
    nudgeText: 'Take your time — longer answers help us find a better match for you.',
  },
  Q75: {
    chatId: 'Q75',
    maxExchanges: 6,
    title: 'Goals & Values',
    nudgeText: 'Take your time — longer answers help us find a better match for you.',
  },
  Q100: {
    chatId: 'Q100',
    maxExchanges: 1,
    title: 'Closing Thoughts',
    nudgeText: 'Share anything that feels important — there are no wrong answers here.',
  },
};
