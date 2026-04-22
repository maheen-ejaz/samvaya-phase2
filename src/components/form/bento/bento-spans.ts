import type { BentoSpan, QuestionConfig, QuestionType } from '@/lib/form/types';

/**
 * Default bento grid span per question type.
 * All questions use single-column layout (col: 1, row: 1).
 *
 * Per-question overrides live on `QuestionConfig.bentoSpan` and win over the
 * type default — see `getBentoSpan()`.
 */
export const BENTO_SPANS: Record<QuestionType, BentoSpan> = {
  // All types use single column
  text:                   { col: 1, row: 1 },
  email:                  { col: 1, row: 1 },
  phone:                  { col: 1, row: 1 },
  number:                 { col: 1, row: 1 },
  date:                   { col: 1, row: 1 },
  time:                   { col: 1, row: 1 },
  select:                 { col: 1, row: 1 },
  range:                  { col: 1, row: 1 },
  multi_select:           { col: 1, row: 1 },
  illustrated_mc:         { col: 1, row: 1 },
  international_location: { col: 1, row: 1 },
  dual_location:          { col: 1, row: 1 },
  timeline:               { col: 1, row: 1 },
  bgv_consent:            { col: 1, row: 1 },
  file_upload:            { col: 1, row: 1 },
  guided_photo_upload:    { col: 1, row: 1 },
  claude_chat:            { col: 1, row: 1 },
};

export function getBentoSpan(question: QuestionConfig): BentoSpan {
  if (question.bentoSpan) return question.bentoSpan;
  return BENTO_SPANS[question.type] ?? { col: 1, row: 1 };
}

/** Tailwind / globals.css class names for a bento tile span. */
export function spanClassNames(span: BentoSpan): string {
  return `bento-col-${span.col} bento-row-${span.row}`;
}
