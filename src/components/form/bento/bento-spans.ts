import type { BentoSpan, QuestionConfig, QuestionType } from '@/lib/form/types';

/**
 * Default bento grid span per question type.
 * The desktop grid is 3 columns; mobile renders 1 column regardless.
 *
 * `col` and `row` are 1, 2, or 3 — the number of grid cells the tile occupies
 * on desktop. CSS `grid-auto-flow: dense` packs smaller tiles into the gaps.
 *
 * Per-question overrides live on `QuestionConfig.bentoSpan` and win over the
 * type default — see `getBentoSpan()`.
 */
export const BENTO_SPANS: Record<QuestionType, BentoSpan> = {
  // Compact single-cell inputs
  text:                   { col: 1, row: 1 },
  email:                  { col: 1, row: 1 },
  phone:                  { col: 1, row: 1 },
  number:                 { col: 1, row: 1 },
  date:                   { col: 1, row: 1 },
  time:                   { col: 1, row: 1 },
  select:                 { col: 1, row: 1 },
  range:                  { col: 1, row: 1 },

  // Wider chip / option grids
  multi_select:           { col: 2, row: 2 },
  illustrated_mc:         { col: 2, row: 2 },

  // Composite / heavy inputs
  international_location: { col: 2, row: 1 },
  dual_location:          { col: 3, row: 2 },
  timeline:               { col: 3, row: 2 },
  bgv_consent:            { col: 3, row: 2 },
  file_upload:            { col: 2, row: 2 },
  guided_photo_upload:    { col: 3, row: 3 },

  // Chats render full-screen on their own route — listed here as a link tile
  claude_chat:            { col: 3, row: 1 },
};

export function getBentoSpan(question: QuestionConfig): BentoSpan {
  if (question.bentoSpan) return question.bentoSpan;
  return BENTO_SPANS[question.type] ?? { col: 1, row: 1 };
}

/** Tailwind / globals.css class names for a bento tile span. */
export function spanClassNames(span: BentoSpan): string {
  return `bento-col-${span.col} bento-row-${span.row}`;
}
