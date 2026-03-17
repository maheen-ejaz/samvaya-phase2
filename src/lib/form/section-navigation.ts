import { QUESTIONS, getQuestion, getQuestionsBySection } from './questions';
import { isQuestionVisible } from './conditional-rules';
import { SECTIONS, getSectionForQuestion, getSectionIndex } from './sections';
import type { FormAnswers, SectionId } from './types';

// ============================================================
// Visible questions for a section (no group collapsing)
// ============================================================

/**
 * Returns all visible questions in a section, including grouped members.
 * Unlike computeVisibleQuestions which collapses groups for navigation,
 * this returns every individual question for rendering a full section.
 */
export function getVisibleQuestionsForSection(
  sectionId: SectionId,
  answers: FormAnswers
): string[] {
  const sectionQuestions = getQuestionsBySection(sectionId);
  return sectionQuestions
    .filter((q) => isQuestionVisible(q.id, answers))
    .map((q) => q.id);
}

// ============================================================
// Question validation (extracted from NavigationButtons logic)
// ============================================================

/**
 * Check if a single question has a valid answer.
 * Handles all question types including file_upload, dual_location, timeline.
 */
export function isQuestionAnswered(questionId: string, answers: FormAnswers): boolean {
  const question = getQuestion(questionId);
  if (!question) return false;
  if (!question.required) return true;
  // Hidden conditional questions don't block
  if (!isQuestionVisible(questionId, answers)) return true;

  const value = answers[questionId];
  if (value === undefined || value === null || value === '') return false;
  if (Array.isArray(value) && value.length === 0) return false;

  // File upload: check count against minimum
  if (question.type === 'file_upload') {
    const config = question.fileUploadConfig;
    if (!config) return false;
    if (!Array.isArray(value)) return false;
    return value.length >= config.minFiles;
  }

  // International location: valid if both city and country are filled
  if (question.type === 'international_location') {
    if (!value || typeof value !== 'object') return false;
    const loc = value as { city?: string; country?: string };
    return !!(loc.city?.trim() && loc.country?.trim());
  }

  // Dual location: valid if "no preference" or at least one location
  if (question.type === 'dual_location') {
    if (!value || typeof value !== 'object') return false;
    const loc = value as { states?: string[]; countries?: string[]; noPreference?: boolean };
    return (
      loc.noPreference === true ||
      (Array.isArray(loc.states) && loc.states.length > 0) ||
      (Array.isArray(loc.countries) && loc.countries.length > 0)
    );
  }

  // Timeline: at least one complete entry with valid dates
  if (question.type === 'timeline') {
    if (!Array.isArray(value) || value.length === 0) return false;
    return (value as Array<Record<string, unknown>>).every((entry) => {
      if (!entry.org_name || !entry.designation || !entry.start_month || !entry.start_year) {
        return false;
      }
      if (!entry.is_current) {
        if (!entry.end_month || !entry.end_year) return false;
        const endYear = entry.end_year as number;
        const startYear = entry.start_year as number;
        if (endYear < startYear) return false;
        if (endYear === startYear && (entry.end_month as number) < (entry.start_month as number))
          return false;
      }
      return true;
    });
  }

  // Claude chat: considered answered if chat state exists with isComplete
  if (question.type === 'claude_chat') {
    return true; // Chat completion is managed by ChatInterface, not form validation
  }

  return true;
}

// ============================================================
// Section completion status
// ============================================================

export type SectionStatus = 'empty' | 'partial' | 'complete';

export function getSectionCompletionStatus(
  sectionId: SectionId,
  answers: FormAnswers
): SectionStatus {
  const visibleIds = getVisibleQuestionsForSection(sectionId, answers);
  if (visibleIds.length === 0) return 'complete';

  // Check if section only has claude_chat questions (e.g. Section M)
  const chatOnlyIds = visibleIds.filter((id) => {
    const q = getQuestion(id);
    return q?.type === 'claude_chat';
  });
  if (chatOnlyIds.length === visibleIds.length) {
    // Chat-only section: check if chat has been completed via answers
    const allChatsAnswered = chatOnlyIds.every((id) => isQuestionAnswered(id, answers));
    return allChatsAnswered ? 'complete' : 'empty';
  }

  const requiredIds = visibleIds.filter((id) => {
    const q = getQuestion(id);
    return q?.required && q.type !== 'claude_chat';
  });

  if (requiredIds.length === 0) return 'complete';

  let answeredCount = 0;
  for (const id of requiredIds) {
    if (isQuestionAnswered(id, answers)) answeredCount++;
  }

  if (answeredCount === 0) return 'empty';
  if (answeredCount === requiredIds.length) return 'complete';
  return 'partial';
}

// ============================================================
// Section validation
// ============================================================

export function isSectionValid(
  sectionId: SectionId,
  answers: FormAnswers
): { valid: boolean; firstInvalidId?: string } {
  const visibleIds = getVisibleQuestionsForSection(sectionId, answers);

  for (const id of visibleIds) {
    if (!isQuestionAnswered(id, answers)) {
      return { valid: false, firstInvalidId: id };
    }
  }

  return { valid: true };
}

// ============================================================
// Section navigation helpers
// ============================================================

export function getNextSectionId(currentSectionId: SectionId): SectionId | null {
  const idx = getSectionIndex(currentSectionId);
  if (idx < 0 || idx >= SECTIONS.length - 1) return null;
  return SECTIONS[idx + 1].id;
}

export function getPrevSectionId(currentSectionId: SectionId): SectionId | null {
  const idx = getSectionIndex(currentSectionId);
  if (idx <= 0) return null;
  return SECTIONS[idx - 1].id;
}

/**
 * Calculate overall form completion as a percentage (0-100).
 * Counts required answered questions across all sections.
 */
export function calculateOverallProgress(answers: FormAnswers): number {
  let totalRequired = 0;
  let totalAnswered = 0;

  for (const q of QUESTIONS) {
    if (!q.required || q.type === 'claude_chat') continue;
    if (!isQuestionVisible(q.id, answers)) continue;
    totalRequired++;
    if (isQuestionAnswered(q.id, answers)) totalAnswered++;
  }

  if (totalRequired === 0) return 100;
  return Math.round((totalAnswered / totalRequired) * 100);
}

// ============================================================
// Sub-group definitions for large sections
// ============================================================

export interface SubGroup {
  label: string;
  questionRange: [number, number]; // inclusive
}

const SECTION_SUBGROUPS: Partial<Record<SectionId, SubGroup[]>> = {
  A: [
    { label: 'Personal Info', questionRange: [1, 6] },
    { label: 'Background', questionRange: [7, 15] },
    { label: 'Languages', questionRange: [16, 17] },
  ],
  B: [
    { label: 'Citizenship & Visa', questionRange: [18, 20] },
    { label: 'Current Location', questionRange: [21, 23] },
    { label: 'Permanent Address', questionRange: [24, 26] },
  ],
  C: [
    { label: 'Religion', questionRange: [27, 29] },
    { label: 'Caste & Community', questionRange: [30, 31] },
  ],
  D: [
    { label: "Parents' Details", questionRange: [32, 37] },
    { label: 'Siblings', questionRange: [39, 39] },
  ],
  F: [
    { label: 'Diet & Habits', questionRange: [43, 48] },
    { label: 'Health', questionRange: [49, 52] },
  ],
  H: [
    { label: 'Medical Status', questionRange: [56, 57] },
    { label: 'Qualifications', questionRange: [58, 60] },
  ],
  J: [
    { label: 'Life Goals', questionRange: [63, 68] },
    { label: 'Relationship Values', questionRange: [69, 74] },
  ],
  K: [
    { label: 'Age & Physical', questionRange: [76, 77] },
    { label: 'Professional', questionRange: [78, 79] },
    { label: 'Location & Language', questionRange: [80, 81] },
    { label: 'Lifestyle & Appearance', questionRange: [82, 88] },
    { label: 'Family & Values', questionRange: [89, 92] },
    { label: 'Personal Qualities', questionRange: [93, 94] },
  ],
  L: [
    { label: 'Photos', questionRange: [95, 96] },
    { label: 'Documents', questionRange: [97, 98] },
    { label: 'BGV Consent', questionRange: [99, 99] },
  ],
  M: [
    { label: 'Family Background', questionRange: [101, 101] },
    { label: 'Goals & Values', questionRange: [102, 102] },
    { label: 'Closing', questionRange: [103, 103] },
  ],
};

export function getSubGroups(sectionId: SectionId): SubGroup[] | null {
  return SECTION_SUBGROUPS[sectionId] ?? null;
}

/**
 * Given a question number and section, return which sub-group it belongs to.
 * Returns the sub-group label or null if no sub-grouping is defined.
 */
export function getSubGroupForQuestion(
  sectionId: SectionId,
  questionNumber: number
): string | null {
  const subGroups = SECTION_SUBGROUPS[sectionId];
  if (!subGroups) return null;

  for (const sg of subGroups) {
    if (questionNumber >= sg.questionRange[0] && questionNumber <= sg.questionRange[1]) {
      return sg.label;
    }
  }
  return null;
}
