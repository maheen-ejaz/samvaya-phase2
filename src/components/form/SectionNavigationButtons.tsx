'use client';

import { useState } from 'react';
import { useForm } from './FormProvider';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import { isSectionValid, getNextSectionId, getPrevSectionId, getSectionCompletionStatus } from '@/lib/form/section-navigation';
import { scrollMainToElement } from './scroll-utils';
import type { SectionId } from '@/lib/form/types';

interface SectionNavigationButtonsProps {
  onValidationErrors: (errors: Set<string>) => void;
}

export function SectionNavigationButtons({ onValidationErrors }: SectionNavigationButtonsProps) {
  const { state, navigateNextSection, navigatePrevSection, navigateToSection, submitForm, submitError } = useForm();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [conversationsBlockedSections, setConversationsBlockedSections] = useState<{ id: SectionId; label: string }[]>([]);

  const { currentSectionId, answers } = state;
  const sectionIndex = getSectionIndex(currentSectionId);
  const isFirst = sectionIndex === 0;
  const isLast = sectionIndex === SECTIONS.length - 1;

  const hasPrev = getPrevSectionId(currentSectionId) !== null;
  const hasNext = getNextSectionId(currentSectionId) !== null;

  // Section M is the last section before Conversations (N)
  const isBeforeConversations = currentSectionId === 'M';

  const handleNext = () => {
    const result = isSectionValid(currentSectionId, answers);
    if (!result.valid && result.firstInvalidId) {
      onValidationErrors(new Set([result.firstInvalidId]));
      scrollMainToElement(result.firstInvalidId);
      return;
    }

    // Gate: if about to enter Section N, check all prior sections are complete
    if (isBeforeConversations) {
      const incomplete = SECTIONS.filter((s) => s.id !== 'N' && getSectionCompletionStatus(s.id as SectionId, answers) !== 'complete');
      if (incomplete.length > 0) {
        setConversationsBlockedSections(incomplete.map((s) => ({ id: s.id as SectionId, label: s.label })));
        return;
      }
    }

    setConversationsBlockedSections([]);
    onValidationErrors(new Set());
    navigateNextSection();
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Move focus to section heading for keyboard users
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('[data-section-heading]');
      if (heading) { heading.tabIndex = -1; heading.focus(); }
    });
  };

  const handlePrev = () => {
    onValidationErrors(new Set());
    navigatePrevSection();
    const main = document.querySelector('main');
    if (main) main.scrollTop = 0;
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Move focus to section heading for keyboard users
    requestAnimationFrame(() => {
      const heading = document.querySelector<HTMLElement>('[data-section-heading]');
      if (heading) { heading.tabIndex = -1; heading.focus(); }
    });
  };

  const handleSubmit = async () => {
    const result = isSectionValid(currentSectionId, answers);
    if (!result.valid && result.firstInvalidId) {
      onValidationErrors(new Set([result.firstInvalidId]));
      scrollMainToElement(result.firstInvalidId);
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
      {conversationsBlockedSections.length > 0 && (
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-4" role="alert">
          <p className="mb-2 text-sm font-semibold text-amber-800">
            Complete these sections before starting the conversations:
          </p>
          <ul className="space-y-1">
            {conversationsBlockedSections.map((s) => (
              <li key={s.id} className="flex items-center justify-between">
                <span className="text-sm text-amber-700">• {s.label}</span>
                <button
                  onClick={() => {
                    setConversationsBlockedSections([]);
                    navigateToSection(s.id);
                    const main = document.querySelector('main');
                    if (main) main.scrollTop = 0;
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="ml-4 rounded px-2 py-0.5 text-xs font-medium text-amber-800 underline hover:text-amber-900"
                >
                  Go →
                </button>
              </li>
            ))}
          </ul>
        </div>
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
            className="rounded-lg bg-rose-600 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-samvaya-red/20 disabled:bg-gray-200 disabled:text-gray-600 disabled:cursor-not-allowed"
          >
            <span aria-live="polite">
              {submitted ? 'Submitted' : submitting ? 'Submitting...' : 'Submit'}
            </span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            className="flex items-center gap-1.5 rounded-lg bg-rose-600 px-8 py-2.5 text-sm font-medium text-white transition-colors hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-samvaya-red/20"
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
