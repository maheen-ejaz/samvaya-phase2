import type { QuestionOption } from '@/lib/form/types';

/**
 * Religion options for Q27.
 * Ordered by prevalence in India, with 'Other' and 'Prefer not to say' at the end.
 */
export const RELIGIONS: QuestionOption[] = [
  { value: 'hindu', label: 'Hindu' },
  { value: 'muslim', label: 'Muslim' },
  { value: 'christian', label: 'Christian' },
  { value: 'sikh', label: 'Sikh' },
  { value: 'buddhist', label: 'Buddhist' },
  { value: 'jain', label: 'Jain' },
  { value: 'zoroastrian', label: 'Zoroastrian / Parsi' },
  { value: 'jewish', label: 'Jewish' },
  { value: 'atheist', label: 'Atheist' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
];
