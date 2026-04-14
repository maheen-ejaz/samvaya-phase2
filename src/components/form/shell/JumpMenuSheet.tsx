'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useForm } from '../FormProvider';
import { buildSectionList, sectionPath, type SectionListItem } from '@/lib/form/section-routing';
import { SECTIONS } from '@/lib/form/sections';
import { getSectionCompletionStatus } from '@/lib/form/section-navigation';
import type { SectionId } from '@/lib/form/types';

interface JumpMenuSheetProps {
  open: boolean;
  onClose: () => void;
  currentSection: SectionId;
  resumeSection: SectionId;
}

// Section groups for visual organisation
const SECTION_GROUPS = [
  { label: 'About You', ids: ['A', 'B', 'C'] },
  { label: 'Life & Values', ids: ['D', 'E', 'F', 'G'] },
  { label: 'Career & Finances', ids: ['H', 'I', 'J'] },
  { label: 'Compatibility', ids: ['K', 'L'] },
  { label: 'Verification', ids: ['M', 'N'] },
] as const;

/**
 * Slide-down sheet listing all 14 sections with status (complete / current / locked).
 * Tapping an unlocked section navigates via Next.js routing.
 * Includes progress summary, section grouping, and estimated times.
 */
export function JumpMenuSheet({ open, onClose, currentSection, resumeSection }: JumpMenuSheetProps) {
  const { state } = useForm();
  const items = buildSectionList(state.answers, resumeSection, currentSection);
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  // Calculate overall progress stats
  const completedCount = items.filter((i) => i.status === 'complete').length;
  const totalCount = items.length;
  const completedPct = Math.round((completedCount / totalCount) * 100);

  // Remaining time = sum of estimatedMinutes for incomplete sections
  const remainingMinutes = SECTIONS.filter((s) => {
    const status = getSectionCompletionStatus(s.id, state.answers);
    return status !== 'complete';
  }).reduce((sum, s) => sum + (s.estimatedMinutes ?? 0), 0);

  // Close on Escape; focus first interactive link on open
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    // Delay to let the animation settle before focusing
    const t = setTimeout(() => firstLinkRef.current?.focus(), 50);
    return () => {
      document.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  // Build a map from sectionId → item for quick lookup
  const itemMap = new Map(items.map((i) => [i.id, i]));
  let firstLinkSet = false;

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close section menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 animate-fade-in"
      />

      {/* Sheet — bottom sheet on mobile, top sheet on desktop */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sections"
        className="absolute left-0 right-0 bottom-0 lg:bottom-auto lg:top-0 bg-white shadow-xl animate-fade-in-up max-h-[85vh] overflow-y-auto rounded-t-2xl lg:rounded-none"
      >
        {/* Drag handle — mobile only */}
        <div className="flex justify-center pt-3 pb-1 lg:hidden" aria-hidden="true">
          <div className="h-1 w-10 rounded-full bg-[color:var(--color-form-border-strong)]" />
        </div>

        <div className="mx-auto max-w-3xl px-6 py-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:px-10 lg:py-8 lg:pb-8">
          {/* Header row */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="form-eyebrow">Sections</h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="form-caption hover:text-[color:var(--color-form-text-primary)] transition-colors"
            >
              Close
            </button>
          </div>

          {/* Progress summary card */}
          <div className="mb-6 rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-4 py-3">
            <div className="flex items-center justify-between mb-2">
              <span className="form-caption">
                {completedCount} of {totalCount} sections complete
              </span>
              <span className="form-caption">
                {remainingMinutes > 0 ? `~${remainingMinutes} min remaining` : 'All done!'}
              </span>
            </div>
            <div className="form-progress-track">
              <div
                className="form-progress-fill"
                style={{ width: `${completedPct}%` }}
              />
            </div>
          </div>

          {/* Helper hint for jump-back */}
          {completedCount > 0 && (
            <p className="form-caption mb-4 text-[color:var(--color-form-text-tertiary)]">
              ← Tap any completed section to jump back and edit your answers.
            </p>
          )}

          {/* Grouped section list */}
          <div className="space-y-5">
            {SECTION_GROUPS.map((group) => {
              const groupItems = group.ids
                .map((id) => itemMap.get(id as SectionId))
                .filter(Boolean) as SectionListItem[];
              if (groupItems.length === 0) return null;

              return (
                <div key={group.label}>
                  <div className="form-caption font-medium text-[color:var(--color-form-text-tertiary)] uppercase tracking-wider mb-1 pb-1 border-b border-[color:var(--color-form-border)]">
                    {group.label}
                  </div>
                  <ul className="space-y-0.5">
                    {groupItems.map((item) => {
                      const isFirst = !firstLinkSet && item.unlocked && !item.isCurrent;
                      if (isFirst) firstLinkSet = true;
                      return (
                        <SectionListRow
                          key={item.id}
                          item={item}
                          onClose={onClose}
                          firstRef={isFirst ? firstLinkRef : undefined}
                        />
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionListRow({
  item,
  onClose,
  firstRef,
}: {
  item: SectionListItem;
  onClose: () => void;
  firstRef?: React.RefObject<HTMLAnchorElement | null>;
}) {
  const dotClass = item.isCurrent
    ? 'bg-[color:var(--color-samvaya-red)]'
    : item.status === 'complete'
    ? 'bg-[color:var(--color-form-success)]'
    : 'bg-[color:var(--color-form-border-strong)]';

  const dotIcon =
    item.status === 'complete' && !item.isCurrent ? (
      <svg viewBox="0 0 12 12" className="h-2.5 w-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="2 6.5 5 9.5 10 3" />
      </svg>
    ) : null;

  // Estimated time from SECTIONS metadata
  const sectionMeta = SECTIONS.find((s) => s.id === item.id);
  const timeLabel = item.status === 'complete' ? 'Done' : sectionMeta ? `~${sectionMeta.estimatedMinutes} min` : null;

  const content = (
    <div className="flex items-center gap-4 py-2.5">
      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${dotClass} flex-shrink-0`}>
        {dotIcon}
      </span>
      <div className="flex-1 min-w-0">
        <div
          className={`text-[15px] leading-tight ${
            item.unlocked ? 'text-[color:var(--color-form-text-primary)]' : 'text-[color:var(--color-form-text-tertiary)]'
          }`}
        >
          {item.label}
        </div>
        {item.description && (
          <div className="form-caption mt-0.5 truncate">{item.description}</div>
        )}
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {timeLabel && (
          <span className={`form-caption ${item.status === 'complete' ? 'text-[color:var(--color-form-success)]' : ''}`}>
            {timeLabel}
          </span>
        )}
        {item.isCurrent && <span className="form-eyebrow">Current</span>}
      </div>
    </div>
  );

  if (item.unlocked && !item.isCurrent) {
    return (
      <li>
        <Link
          ref={firstRef}
          href={sectionPath(item.id)}
          onClick={onClose}
          className="block px-3 -mx-3 rounded-lg hover:bg-[color:var(--color-form-surface-muted)] transition-colors focus-visible:outline-2 focus-visible:outline-[color:var(--color-samvaya-red)] focus-visible:outline-offset-1"
        >
          {content}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <div className="px-3 -mx-3 cursor-default">{content}</div>
    </li>
  );
}
