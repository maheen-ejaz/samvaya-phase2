'use client';

import Link from 'next/link';
import { useForm } from '../FormProvider';
import { getVisibleQuestionsForSection } from '@/lib/form/section-navigation';
import { getSectionMeta, getSectionPosition, sectionPath } from '@/lib/form/section-routing';
import type { SectionId } from '@/lib/form/types';

interface SectionIntroProps {
  sectionId: SectionId;
}

/**
 * Decompression screen shown before a section's questions begin.
 * Renders eyebrow, title, 1-line purpose, # of visible questions,
 * estimated time, and (for sensitive sections) the confidentiality callout.
 */
export function SectionIntro({ sectionId }: SectionIntroProps) {
  const { state } = useForm();
  const meta = getSectionMeta(sectionId);
  const { position, total } = getSectionPosition(sectionId);

  if (!meta) return null;

  const visibleIds = getVisibleQuestionsForSection(sectionId, state.answers);
  const questionCount = visibleIds.length;
  const positionLabel = String(position).padStart(2, '0');

  return (
    <div className="max-w-xl mx-auto py-12 lg:py-20">
      <div className="form-eyebrow mb-4 text-center">
        Section {positionLabel} of {total}
      </div>
      <h1 className="form-title text-center mb-4">{meta.label}</h1>
      {meta.description && (
        <p className="form-subtitle text-center mb-10">{meta.description}</p>
      )}

      <div className="flex items-center justify-center gap-3 mb-10">
        <span className="form-caption">
          {questionCount} {questionCount === 1 ? 'question' : 'questions'}
        </span>
        {meta.estimatedMinutes && (
          <>
            <span className="form-caption" aria-hidden="true">·</span>
            <span className="form-caption">~{meta.estimatedMinutes} min</span>
          </>
        )}
      </div>

      {meta.showConfidentialityCallout && meta.confidentialityText && (
        <div className="mb-10 rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-5 py-4">
          <div className="flex items-start gap-3">
            <svg
              viewBox="0 0 24 24"
              className="mt-0.5 h-5 w-5 flex-shrink-0 text-[color:var(--color-form-text-secondary)]"
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

      <div className="flex justify-center">
        <Link href={sectionPath(sectionId)} className="form-btn-primary min-w-[14rem]">
          Begin section
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="2" y1="8" x2="13" y2="8" />
            <polyline points="9 4 13 8 9 12" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
