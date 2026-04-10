'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useForm } from '../FormProvider';
import { buildSectionList, sectionPath, type SectionListItem } from '@/lib/form/section-routing';
import type { SectionId } from '@/lib/form/types';

interface JumpMenuSheetProps {
  open: boolean;
  onClose: () => void;
  currentSection: SectionId;
  resumeSection: SectionId;
}

/**
 * Slide-down sheet listing all 14 sections with status (complete / current / locked).
 * Tapping an unlocked section navigates via Next.js routing.
 */
export function JumpMenuSheet({ open, onClose, currentSection, resumeSection }: JumpMenuSheetProps) {
  const { state } = useForm();
  const items = buildSectionList(state.answers, resumeSection, currentSection);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
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

  return (
    <div className="fixed inset-0 z-50">
      {/* Scrim */}
      <button
        type="button"
        aria-label="Close section menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/30 animate-fade-in"
      />

      {/* Sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Sections"
        className="absolute left-0 right-0 top-0 bg-white shadow-xl animate-fade-in-up max-h-[85vh] overflow-y-auto"
      >
        <div className="mx-auto max-w-3xl px-6 py-6 lg:px-10 lg:py-8">
          <div className="flex items-center justify-between mb-6">
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

          <ul className="space-y-1">
            {items.map((item) => (
              <SectionListRow key={item.id} item={item} onClose={onClose} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function SectionListRow({ item, onClose }: { item: SectionListItem; onClose: () => void }) {
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

  const content = (
    <div className="flex items-center gap-4 py-3">
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
      {item.isCurrent && <span className="form-eyebrow">Current</span>}
    </div>
  );

  if (item.unlocked && !item.isCurrent) {
    return (
      <li>
        <Link
          href={sectionPath(item.id)}
          onClick={onClose}
          className="block px-3 -mx-3 rounded-lg hover:bg-[color:var(--color-form-surface-muted)] transition-colors"
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
