'use client';

import { useState } from 'react';
import { useForm } from './FormProvider';
import { getQuestion } from '@/lib/form/questions';
import { isQuestionVisible } from '@/lib/form/conditional-rules';

export function NavigationButtons() {
  const { state, navigateNext, navigatePrev, flushNow } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const isFirst = state.currentQuestionIndex === 0;
  const isLast = state.currentQuestionIndex === state.visibleQuestions.length - 1;

  // Check if current question has a valid answer (for required questions)
  const currentId = state.visibleQuestions[state.currentQuestionIndex];
  const currentQuestion = currentId ? getQuestion(currentId) : undefined;
  const currentValue = currentId ? state.answers[currentId] : undefined;

  const hasAnswer = (() => {
    if (!currentQuestion) return false;
    if (!currentQuestion.required) return true; // Optional questions can be skipped
    // Hidden conditional questions don't block navigation
    if (currentId && !isQuestionVisible(currentId, state.answers)) return true;

    if (currentValue === undefined || currentValue === null || currentValue === '') {
      return false;
    }
    if (Array.isArray(currentValue) && currentValue.length === 0) return false;

    // TODO: When file_upload, timeline, and claude_chat components are fully
    // implemented, remove this bypass so users must complete them before proceeding.
    if (currentQuestion.type === 'file_upload' || currentQuestion.type === 'timeline' || currentQuestion.type === 'claude_chat') {
      return true;
    }

    return true;
  })();

  // For grouped questions, check all questions in the group
  const groupComplete = (() => {
    if (!currentQuestion?.groupWith) return hasAnswer;

    const groupIds = [currentQuestion.id, ...currentQuestion.groupWith];
    return groupIds.every((id) => {
      const q = getQuestion(id);
      if (!q || !q.required) return true;
      // Hidden conditional questions don't block navigation
      if (!isQuestionVisible(id, state.answers)) return true;
      const val = state.answers[id];
      if (val === undefined || val === null || val === '') return false;
      if (Array.isArray(val) && val.length === 0) return false;
      return true;
    });
  })();

  return (
    <div className="mt-8 flex items-center justify-between">
      <button
        onClick={navigatePrev}
        disabled={isFirst}
        className="flex items-center gap-1 rounded-lg px-4 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:invisible"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 19.5 8.25 12l7.5-7.5"
          />
        </svg>
        Back
      </button>

      {isLast ? (
        <button
          onClick={async () => {
            setSubmitting(true);
            await flushNow();
            setSubmitted(true);
            setSubmitting(false);
          }}
          disabled={!groupComplete || submitting || submitted}
          className="rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:bg-gray-300 disabled:text-gray-500"
        >
          {submitted ? 'Form Saved' : submitting ? 'Saving...' : 'Submit'}
        </button>
      ) : (
        <button
          onClick={navigateNext}
          disabled={!groupComplete}
          className="flex items-center gap-1 rounded-lg bg-rose-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:bg-gray-300 disabled:text-gray-500"
        >
          Next
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m8.25 4.5 7.5 7.5-7.5 7.5"
            />
          </svg>
        </button>
      )}
    </div>
  );
}
