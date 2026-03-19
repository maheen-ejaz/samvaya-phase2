'use client';

import { useState } from 'react';
import { useForm } from './FormProvider';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import { isSectionValid, getNextSectionId, getPrevSectionId } from '@/lib/form/section-navigation';

interface SectionNavigationButtonsProps {
  onValidationErrors: (errors: Set<string>) => void;
}

export function SectionNavigationButtons({ onValidationErrors }: SectionNavigationButtonsProps) {
  const { state, navigateNextSection, navigatePrevSection, submitForm, submitError } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const { currentSectionId, answers } = state;
  const sectionIndex = getSectionIndex(currentSectionId);
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === SECTIONS.length - 1;

  const hasPrev = getPrevSectionId(currentSectionId) !== null;
  const hasNext = getNextSectionId(currentSectionId) !== null;

  const handleNext = () => {
    const result = isSectionValid(currentSectionId, answers);
    if (!result.valid && result.firstInvalidId) {
      onValidationErrors(new Set([result.firstInvalidId]));
      document.getElementById(result.firstInvalidId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }
    onValidationErrors(new Set());
    navigateNextSection();
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePrev = () => {
    onValidationErrors(new Set());
    navigatePrevSection();
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async () => {
    const result = isSectionValid(currentSectionId, answers);
    if (!result.valid && result.firstInvalidId) {
      onValidationErrors(new Set([result.firstInvalidId]));
      document.getElementById(result.firstInvalidId)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
      return;
    }

    setSubmitting(true);
    const success = await submitForm();
    if (success) {
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="mt-12 border-t border-gray-200 pt-6">
      {submitError && isLast && (
        <p className="mb-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700" role="alert">
          {submitError}
        </p>
      )}
      <div className="flex items-center justify-between">
        <button
          onClick={handlePrev}
          disabled={isFirst || !hasPrev}
          className="flex items-center gap-1.5 rounded-lg px-5 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 disabled:invisible"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
          </svg>
          Previous
        </button>

        {isLast ? (
          <button
            onClick={handleSubmit}
            disabled={submitting || submitted}
            className="rounded-lg bg-samvaya-red px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-samvaya-red-dark focus:outline-none focus:ring-2 focus:ring-samvaya-red/20 disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            <span aria-live="polite">
              {submitted ? 'Submitted' : submitting ? 'Submitting...' : 'Submit'}
            </span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-lg bg-samvaya-red px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-samvaya-red-dark focus:outline-none focus:ring-2 focus:ring-samvaya-red/20"
          >
            Next Section
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
