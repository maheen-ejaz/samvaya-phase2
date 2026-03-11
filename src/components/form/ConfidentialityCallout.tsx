'use client';

import { useForm } from './FormProvider';
import { getQuestion } from '@/lib/form/questions';
import { SECTIONS } from '@/lib/form/sections';

// Sections that show a confidentiality callout at their first question
const CALLOUT_FIRST_QUESTIONS = new Map<string, string>();
for (const section of SECTIONS) {
  if (section.showConfidentialityCallout && section.confidentialityText) {
    CALLOUT_FIRST_QUESTIONS.set(`Q${section.questionRange[0]}`, section.confidentialityText);
  }
}

export function ConfidentialityCallout() {
  const { state } = useForm();
  const currentId = state.visibleQuestions[state.currentQuestionIndex];

  if (!currentId) return null;

  const calloutText = CALLOUT_FIRST_QUESTIONS.get(currentId);
  if (!calloutText) return null;

  return (
    <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <div className="flex items-start gap-3">
        <svg
          className="mt-0.5 h-5 w-5 shrink-0 text-blue-500"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>
        <p className="text-sm text-blue-800">{calloutText}</p>
      </div>
    </div>
  );
}
