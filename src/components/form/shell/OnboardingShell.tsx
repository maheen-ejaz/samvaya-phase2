'use client';

import { useState, useEffect, type ReactNode } from 'react';
import Link from 'next/link';
import { FormProvider, useForm } from '../FormProvider';
import { SaveStatusBadge } from './SaveStatusBadge';
import { JumpMenuSheet } from './JumpMenuSheet';
import { buildSectionList } from '@/lib/form/section-routing';
import type { FormAnswers, SectionId } from '@/lib/form/types';

interface OnboardingShellProps {
  userId: string;
  initialAnswers: FormAnswers;
  initialGateAnswers: Record<string, string>;
  initialChatState: Record<string, unknown>;
  resumeQuestionNumber: number;
  resumeSection: SectionId;
  currentSection: SectionId;
  children: ReactNode;
}

/**
 * Top-level wrapper for every onboarding screen. Mounts FormProvider once
 * and renders the page chrome (logo + jump menu trigger + save badge).
 *
 * Each section page renders this and passes its current section ID + the
 * already-hydrated initial data from the server. The provider's auto-save
 * engine is created inside the provider's useEffect and persists for the
 * lifetime of this shell.
 */
export function OnboardingShell({
  userId,
  initialAnswers,
  initialGateAnswers,
  initialChatState,
  resumeQuestionNumber,
  resumeSection,
  currentSection,
  children,
}: OnboardingShellProps) {
  const [menuOpen, setMenuOpen] = useState(false);

  // Cmd+K or ? opens the jump menu from anywhere on the page
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (menuOpen) return;
      if (e.key === '?' || (e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setMenuOpen(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <FormProvider
      userId={userId}
      initialAnswers={initialAnswers}
      initialGateAnswers={initialGateAnswers}
      initialChatState={initialChatState}
      resumeQuestionNumber={resumeQuestionNumber}
    >
      <ShellInner
        menuOpen={menuOpen}
        setMenuOpen={setMenuOpen}
        currentSection={currentSection}
        resumeSection={resumeSection}
      >
        {children}
      </ShellInner>
    </FormProvider>
  );
}

/**
 * Inner shell that can access FormContext (must be a child of FormProvider).
 */
function ShellInner({
  menuOpen,
  setMenuOpen,
  currentSection,
  resumeSection,
  children,
}: {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  currentSection: SectionId;
  resumeSection: SectionId;
  children: ReactNode;
}) {
  const { state } = useForm();
  const items = buildSectionList(state.answers, resumeSection, currentSection);
  const completedCount = items.filter((i) => i.status === 'complete').length;
  const totalCount = items.length;
  const overallPct = Math.round((completedCount / totalCount) * 100);

  // Offline detection
  const [isOffline, setIsOffline] = useState(false);
  useEffect(() => {
    const onOffline = () => setIsOffline(true);
    const onOnline = () => setIsOffline(false);
    window.addEventListener('offline', onOffline);
    window.addEventListener('online', onOnline);
    // Set initial state
    if (typeof navigator !== 'undefined') setIsOffline(!navigator.onLine);
    return () => {
      window.removeEventListener('offline', onOffline);
      window.removeEventListener('online', onOnline);
    };
  }, []);

  return (
    <div className="form-surface min-h-[100dvh] flex flex-col">
      {/* Overall progress bar — very top of page */}
      <div className="form-overall-progress">
        <div className="form-overall-progress-fill" style={{ width: `${overallPct}%` }} />
      </div>

      {/* Header chrome — sticky with blur */}
      <header className="form-header-sticky border-b border-[color:var(--color-form-border)]">
        <div className="mx-auto max-w-2xl px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          <Link href="/app" className="flex items-center gap-2">
            <span className="text-[15px] font-medium tracking-tight text-[color:var(--color-form-text-primary)]">
              samvaya
            </span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Section count — only on screens ≥768px to avoid cramping */}
            <span className="form-caption hidden md:block">
              {completedCount} of {totalCount} complete
            </span>
            <SaveStatusBadge />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="form-caption flex items-center gap-2 hover:text-[color:var(--color-form-text-primary)] transition-colors"
              aria-label="Open section menu"
            >
              <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                <line x1="2" y1="4" x2="14" y2="4" />
                <line x1="2" y1="8" x2="14" y2="8" />
                <line x1="2" y1="12" x2="14" y2="12" />
              </svg>
              Sections
            </button>
          </div>
        </div>
      </header>

      {/* Offline banner */}
      {isOffline && (
        <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 text-center">
          <span className="form-caption text-amber-800">
            You&apos;re offline — your answers will sync when you reconnect.
          </span>
        </div>
      )}

      {/* Main content area */}
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-6 py-10">
          {children}
        </div>
      </main>

      {/* Jump menu sheet */}
      <JumpMenuSheet
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        currentSection={currentSection}
        resumeSection={resumeSection}
      />
    </div>
  );
}
