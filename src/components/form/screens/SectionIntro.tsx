'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from '../FormProvider';
import { getVisibleQuestionsForSection, getSectionCompletionStatus } from '@/lib/form/section-navigation';
import { getSectionMeta, getSectionPosition, sectionPath } from '@/lib/form/section-routing';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import type { SectionId } from '@/lib/form/types';

interface SectionIntroProps {
  sectionId: SectionId;
}

// Sections that include an AI conversation — flagged for difficulty signal
const AI_CHAT_SECTIONS: SectionId[] = ['D', 'K', 'N'];

/**
 * Decompression screen shown before a section's questions begin.
 * Renders eyebrow, title, 1-line purpose, # of visible questions,
 * estimated time, difficulty signal, and (for sensitive sections) the
 * confidentiality callout with gold-tinted background.
 */
export function SectionIntro({ sectionId }: SectionIntroProps) {
  const router = useRouter();
  const [isExiting, setIsExiting] = useState(false);
  const { state } = useForm();
  const meta = getSectionMeta(sectionId);
  const { position, total } = getSectionPosition(sectionId);

  if (!meta) return null;

  const visibleIds = getVisibleQuestionsForSection(sectionId, state.answers);
  const questionCount = visibleIds.length;
  const positionLabel = String(position).padStart(2, '0');
  const hasAiChat = AI_CHAT_SECTIONS.includes(sectionId);

  // Motivational micro-copy: check if the previous section was just completed
  const sectionIdx = getSectionIndex(sectionId);
  const prevSection = sectionIdx > 0 ? SECTIONS[sectionIdx - 1] : null;
  const prevComplete = prevSection
    ? getSectionCompletionStatus(prevSection.id, state.answers) === 'complete'
    : false;

  function handleBegin() {
    setIsExiting(true);
    setTimeout(() => router.push(sectionPath(sectionId)), 200);
  }

  return (
    <>
      {/* Animated content wrapper — note: fixed children must be OUTSIDE this div
          because CSS animations leave a transform matrix that creates a containing
          block for fixed-position descendants, breaking fixed CTA positioning. */}
      <div className={`max-w-xl mx-auto py-12 lg:py-20 ${isExiting ? 'form-section-exit' : 'form-section-enter'}`}>
        {/* Motivational micro-copy when arriving from a completed section */}
        {prevComplete && prevSection && (
          <div className="mb-6 text-center">
            <span className="form-caption text-[color:var(--color-form-success)] flex items-center justify-center gap-1.5">
              <svg viewBox="0 0 12 12" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="2 6.5 5 9.5 10 3" />
              </svg>
              {prevSection.label} complete
            </span>
          </div>
        )}

        <div className="form-eyebrow mb-4 text-center">
          Section {positionLabel} of {total}
        </div>
        <h1 className="form-title text-center mb-4">{meta.label}</h1>
        {meta.description && (
          <p className="form-subtitle text-center mb-8">{meta.description}</p>
        )}

        {/* Meta row: question count + time + AI flag */}
        <div className="flex items-center justify-center flex-wrap gap-3 mb-8">
          <span className="form-caption">
            {questionCount} {questionCount === 1 ? 'question' : 'questions'}
          </span>
          {meta.estimatedMinutes && (
            <>
              <span className="form-caption" aria-hidden="true">·</span>
              <span className="form-caption">~{meta.estimatedMinutes} min</span>
            </>
          )}
          {hasAiChat && (
            <>
              <span className="form-caption" aria-hidden="true">·</span>
              <span className="form-caption flex items-center gap-1">
                <svg viewBox="0 0 16 16" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h3l3 3 3-3h3a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1z" />
                </svg>
                Includes an AI conversation
              </span>
            </>
          )}
        </div>

        {meta.showConfidentialityCallout && meta.confidentialityText && (
          <div className="mb-8 form-confidentiality-callout">
            <div className="flex items-start gap-3">
              <svg
                viewBox="0 0 24 24"
                className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--color-samvaya-gold)]"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="4" y="11" width="16" height="10" rx="2" />
                <path d="M8 11V7a4 4 0 1 1 8 0v4" />
              </svg>
              <div>
                <div className="form-label mb-1">Private &amp; confidential</div>
                <p className="form-helper">{meta.confidentialityText}</p>
              </div>
            </div>
          </div>
        )}

        {/* Desktop CTA — centered, static */}
        <div className="hidden lg:flex lg:justify-center">
          <button type="button" onClick={handleBegin} className="form-btn-primary lg:min-w-[14rem]">
            Begin section
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="2" y1="8" x2="13" y2="8" />
              <polyline points="9 4 13 8 9 12" />
            </svg>
          </button>
        </div>

        {/* Spacer so content isn't hidden behind the mobile fixed CTA */}
        <div className="h-[calc(5rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true" />
      </div>

      {/* Mobile CTA — fixed to viewport bottom. MUST be outside the animated wrapper
          div above — CSS animations set transform which creates a containing block,
          breaking fixed positioning if the CTA were nested inside. */}
      <div className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-white border-t border-[color:var(--color-form-border)] lg:hidden z-20">
        <button type="button" onClick={handleBegin} className="form-btn-primary w-full">
          Begin section
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="8" x2="13" y2="8" />
            <polyline points="9 4 13 8 9 12" />
          </svg>
        </button>
      </div>
    </>
  );
}
