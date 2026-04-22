import type { ConditionalRule, FormAnswers } from './types';

/**
 * All conditional visibility rules for the form.
 * A question is visible if it has no rule here, or if its condition returns true.
 */
export const CONDITIONAL_RULES: ConditionalRule[] = [
  // Q96: Hidden — GuidedPhotoUpload (Q95) handles all photo uploads
  {
    questionId: 'Q96',
    condition: () => false,
  },
  // Q8: Do you have children? → only if divorced or widowed
  {
    questionId: 'Q8',
    condition: (a: FormAnswers) =>
      a['Q7'] === 'divorced' || a['Q7'] === 'widowed',
  },
  // Q11: Time of birth → only if Q10 = yes
  {
    questionId: 'Q11',
    condition: (a: FormAnswers) => a['Q10'] === 'yes',
  },
  // Q13: City + country of birth → only if born outside India
  {
    questionId: 'Q13',
    condition: (a: FormAnswers) => a['Q12'] === 'outside_india',
  },
  // Q14: City of birth (Indian) → only if born in an Indian state
  {
    questionId: 'Q14',
    condition: (a: FormAnswers) =>
      a['Q12'] !== undefined && a['Q12'] !== 'outside_india',
  },
  // Q20: Employment visa country → only if has visa
  {
    questionId: 'Q20',
    condition: (a: FormAnswers) => a['Q19'] === 'yes',
  },
  // Q22: Indian state → only if residing in India
  {
    questionId: 'Q22',
    condition: (a: FormAnswers) => a['Q21'] === 'india',
  },
  // Q23: Current city → only after country answered (and state if India)
  {
    questionId: 'Q23',
    condition: (a: FormAnswers) => {
      if (!a['Q21']) return false;
      if (a['Q21'] === 'india' && !a['Q22']) return false;
      return true;
    },
  },
  // Q25: Permanent address city → only if different from current
  {
    questionId: 'Q25',
    condition: (a: FormAnswers) => a['Q24'] === 'no',
  },
  // Q28: Religious observance → only after religion is answered
  {
    questionId: 'Q28',
    condition: (a: FormAnswers) => !!a['Q27'],
  },
  // Q30: Comfortable sharing caste → only after religion is answered
  {
    questionId: 'Q30',
    condition: (a: FormAnswers) => !!a['Q27'],
  },
  // Q29: Kundali → only for religions where kundali/horoscope is relevant
  {
    questionId: 'Q29',
    condition: (a: FormAnswers) => {
      const religion = a['Q27'] as string | undefined;
      if (!religion) return false; // Hide until religion is answered
      const kundaliReligions = ['hindu', 'sikh', 'buddhist', 'jain'];
      return kundaliReligions.includes(religion);
    },
  },
  // Q31: Caste/community → only if comfortable sharing
  {
    questionId: 'Q31',
    condition: (a: FormAnswers) => a['Q30'] === 'true',
  },
  // Q34: Father's occupation (other) → only if Q33 = other
  {
    questionId: 'Q34',
    condition: (a: FormAnswers) => a['Q33'] === 'other',
  },
  // Q37: Mother's occupation (other) → only if Q36 = other
  {
    questionId: 'Q37',
    condition: (a: FormAnswers) => a['Q36'] === 'other',
  },
  // Q50: Disability description → only if Q49 = yes
  {
    questionId: 'Q50',
    condition: (a: FormAnswers) => a['Q49'] === 'yes',
  },
  // Q52: Allergy description → only if Q51 = true (DB boolean)
  {
    questionId: 'Q52',
    condition: (a: FormAnswers) => a['Q51'] === 'true',
  },
  // Q54: Top hobbies → only after hobbies selected in Q53
  {
    questionId: 'Q54',
    condition: (a: FormAnswers) => {
      const hobbies = a['Q53'];
      return Array.isArray(hobbies) && hobbies.length > 0;
    },
  },
  // Q55: Other hobbies → only if "other" selected in Q53
  {
    questionId: 'Q55',
    condition: (a: FormAnswers) => {
      const hobbies = a['Q53'];
      return Array.isArray(hobbies) && hobbies.includes('other');
    },
  },
  // Q56b: PG degree type → only if Q56 = completed_pg or pursuing_pg
  {
    questionId: 'Q56b',
    condition: (a: FormAnswers) => a['Q56'] === 'completed_pg' || a['Q56'] === 'pursuing_pg',
  },
  // Q56c: PG degree other → only if Q56b = other
  {
    questionId: 'Q56c',
    condition: (a: FormAnswers) => a['Q56b'] === 'other',
  },
  // Q57: PG plans → only if Q56 = mbbs_passed
  {
    questionId: 'Q57',
    condition: (a: FormAnswers) => a['Q56'] === 'mbbs_passed',
  },
  // Q59: Other qualifications → only if "other" selected in Q58
  {
    questionId: 'Q59',
    condition: (a: FormAnswers) => {
      const quals = a['Q58'];
      return Array.isArray(quals) && quals.includes('other');
    },
  },
  // Q62: Work experience timeline → only if Q61 = true (DB boolean)
  {
    questionId: 'Q62',
    condition: (a: FormAnswers) => a['Q61'] === 'true',
  },
  // QFIN1: Annual CTC → only if user has work experience (Q61 = true)
  {
    questionId: 'QFIN1',
    condition: (a: FormAnswers) => a['Q61'] === 'true',
  },
  // Q68: How many children → only if Q67 = yes
  {
    questionId: 'Q68',
    condition: (a: FormAnswers) => a['Q67'] === 'yes',
  },
  // Q69: When have children → only if Q67 = yes
  {
    questionId: 'Q69',
    condition: (a: FormAnswers) => a['Q67'] === 'yes',
  },
  // Q70: Open to partner with children → only if divorced/widowed AND has children
  {
    questionId: 'Q70',
    condition: (a: FormAnswers) =>
      (a['Q7'] === 'divorced' || a['Q7'] === 'widowed') &&
      a['Q8'] === 'true',
  },
  // Q74: Countries exploring → only if Q73 = true (DB boolean)
  {
    questionId: 'Q74',
    condition: (a: FormAnswers) => a['Q73'] === 'true',
  },
  // Q79: Preferred specialties → only if Q78 = true (DB boolean)
  {
    questionId: 'Q79',
    condition: (a: FormAnswers) => a['Q78'] === 'true',
  },
  // Q94: Other qualities → only if "other" selected in Q93
  {
    questionId: 'Q94',
    condition: (a: FormAnswers) => {
      const qualities = a['Q93'];
      return Array.isArray(qualities) && qualities.includes('other');
    },
  },
  // Q98: Upload kundali → only if Q29 = true (DB boolean)
  {
    questionId: 'Q98',
    condition: (a: FormAnswers) => a['Q29'] === 'true',
  },
];

// Build a lookup map for fast access
const ruleMap = new Map(
  CONDITIONAL_RULES.map((rule) => [rule.questionId, rule])
);

/**
 * Check if a specific question is visible given current answers.
 * Questions without conditional rules are always visible.
 */
export function isQuestionVisible(
  questionId: string,
  answers: FormAnswers
): boolean {
  const rule = ruleMap.get(questionId);
  if (!rule) return true; // No rule = always visible
  return rule.condition(answers);
}
