'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import { FormProvider } from '../FormProvider';
import { SaveStatusBadge } from './SaveStatusBadge';
import { JumpMenuSheet } from './JumpMenuSheet';
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

  return (
    <FormProvider
      userId={userId}
      initialAnswers={initialAnswers}
      initialGateAnswers={initialGateAnswers}
      initialChatState={initialChatState}
      resumeQuestionNumber={resumeQuestionNumber}
    >
      <div className="form-surface min-h-[100dvh] flex flex-col">
        {/* Header chrome */}
        <header className="border-b border-[color:var(--color-form-border)]">
          <div className="mx-auto max-w-6xl px-6 py-4 lg:px-12 flex items-center justify-between gap-4">
            <Link href="/app" className="flex items-center gap-2">
              <span className="text-[15px] font-medium tracking-tight text-[color:var(--color-form-text-primary)]">
                samvaya
              </span>
            </Link>

            <div className="flex items-center gap-5">
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

        {/* Main content area */}
        <main className="flex-1">
          <div className="mx-auto max-w-6xl px-6 py-10 lg:px-12 lg:py-16">
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
    </FormProvider>
  );
}
