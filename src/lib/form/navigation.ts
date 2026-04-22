import { QUESTIONS, getQuestion } from './questions';
import { isQuestionVisible } from './conditional-rules';
import { getSectionForQuestion } from './sections';
import type { FormAnswers, QuestionConfig } from './types';

/**
 * Compute the ordered list of currently visible question IDs,
 * filtering out conditional questions whose conditions are not met.
 * Also collapses grouped questions — only the first in a group appears.
 *
 * IMPORTANT: groupWith depends on QUESTIONS array ordering.
 * The first question encountered in the array becomes the navigation "leader"
 * for its group. All other group members are collapsed into it via the `seen` set.
 * If you reorder QUESTIONS, verify that group leaders remain correct.
 */
export function computeVisibleQuestions(answers: FormAnswers): string[] {
  const visible: string[] = [];
  const seen = new Set<string>();

  for (const q of QUESTIONS) {
    if (seen.has(q.id)) continue;

    if (!isQuestionVisible(q.id, answers)) continue;

    visible.push(q.id);
    seen.add(q.id);

    // If this question is grouped, mark all group members as seen
    // so they don't appear as separate navigation steps
    if (q.groupWith) {
      for (const groupedId of q.groupWith) {
        seen.add(groupedId);
      }
    }
  }

  return visible;
}

/**
 * Get all questions to render for a given navigation step.
 * For grouped questions, returns the full group. For single questions, returns just that one.
 */
export function getQuestionsForStep(questionId: string): QuestionConfig[] {
  const q = getQuestion(questionId);
  if (!q) return [];

  if (q.groupWith && q.groupWith.length > 0) {
    // Return all questions in the group (including this one), in order
    const groupIds = new Set([q.id, ...q.groupWith]);
    return QUESTIONS.filter((question) => groupIds.has(question.id));
  }

  return [q];
}

/**
 * Find the index of a question ID in the visible questions array.
 * Returns 0 if not found (start of form).
 */
export function findQuestionIndex(
  visibleQuestions: string[],
  questionId: string
): number {
  const idx = visibleQuestions.indexOf(questionId);
  return idx >= 0 ? idx : 0;
}

/**
 * Find the closest visible question to a given question number.
 * Used for save-and-resume when the saved question might now be hidden.
 */
export function findClosestVisibleQuestion(
  visibleQuestions: string[],
  targetQuestionNumber: number
): string {
  if (visibleQuestions.length === 0) return 'Q1';

  // Try exact match first
  const targetId = `Q${targetQuestionNumber}`;
  if (visibleQuestions.includes(targetId)) return targetId;

  // Find the closest visible question by number
  let closestId = visibleQuestions[0];
  let closestDiff = Infinity;

  for (const qId of visibleQuestions) {
    const q = getQuestion(qId);
    if (!q) continue;
    const diff = Math.abs(q.questionNumber - targetQuestionNumber);
    if (diff < closestDiff) {
      closestDiff = diff;
      closestId = qId;
    }
  }

  return closestId;
}

/**
 * Get the current section info for a question ID.
 */
export function getCurrentSection(questionId: string) {
  const q = getQuestion(questionId);
  if (!q) return undefined;
  return getSectionForQuestion(q.questionNumber);
}

/**
 * Calculate progress as a percentage (0-100).
 */
export function calculateProgress(
  currentIndex: number,
  totalVisible: number
): number {
  if (totalVisible <= 1) return 0;
  return Math.round((currentIndex / (totalVisible - 1)) * 100);
}
