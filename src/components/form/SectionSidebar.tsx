'use client';

import Image from 'next/image';
import { SECTIONS } from '@/lib/form/sections';
import { getSectionCompletionStatus, calculateOverallProgress, getSubGroups } from '@/lib/form/section-navigation';
import { getQuestion } from '@/lib/form/questions';
import { useForm } from './FormProvider';
import type { SectionStatus, SubGroup } from '@/lib/form/section-navigation';

// ============================================================
// Vertical stepper — line segment between items
// ============================================================

function StepperLine({ status }: { status: SectionStatus; isActive: boolean }) {
  if (status === 'complete') {
    return <div className="h-full w-full bg-white/50" />;
  }
  // partial or active — gradient fade
  if (status === 'partial') {
    return <div className="h-full w-full bg-gradient-to-b from-white/40 to-white/15" />;
  }
  // empty — dashed
  return (
    <div
      className="h-full w-full"
      style={{
        backgroundImage:
          'repeating-linear-gradient(to bottom, rgba(255,255,255,0.2) 0px, rgba(255,255,255,0.2) 3px, transparent 3px, transparent 7px)',
      }}
    />
  );
}

// ============================================================
// Stepper node (dot / check)
// ============================================================

function StepperNode({ status, isActive }: { status: SectionStatus; isActive: boolean }) {
  if (status === 'complete') {
    return (
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white">
        <svg className="h-3 w-3 text-[#5a1a1a]" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
    );
  }

  if (isActive) {
    return (
      <div className="relative flex h-6 w-6 items-center justify-center">
        <div className="absolute h-6 w-6 rounded-full bg-white/15 animate-ping" style={{ animationDuration: '2s' }} />
        <div className="h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" />
      </div>
    );
  }

  if (status === 'partial') {
    return (
      <div
        className="h-5 w-5 rounded-full border-[1.5px] border-white/40"
        style={{
          background: 'linear-gradient(to top, rgba(255,255,255,0.55) 50%, transparent 50%)',
        }}
      />
    );
  }

  // empty
  return <div className="h-2.5 w-2.5 rounded-full bg-white/30" />;
}

// ============================================================
// Save status badge
// ============================================================

function SaveStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'saving':
      return <span className="text-xs text-white/40">Saving...</span>;
    case 'saved':
      return <span className="text-xs text-emerald-300">Saved</span>;
    case 'error':
      return <span className="text-xs text-red-400">Save failed</span>;
    default:
      return null;
  }
}

// ============================================================
// Sidebar content (shared between desktop + mobile drawer)
// ============================================================

interface SidebarContentProps {
  onSectionClick?: () => void; // used by mobile drawer to close on click
}

export function SidebarContent({ onSectionClick }: SidebarContentProps) {
  const { state, navigateToSection, navigateTo } = useForm();
  const progress = calculateOverallProgress(state.answers);

  // Current question number for active sub-group detection
  const currentQId = state.visibleQuestions[state.currentQuestionIndex];
  const currentQNum = getQuestion(currentQId)?.questionNumber ?? 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Brand mark */}
      <div className="px-5 pt-6 pb-2">
        <Image src="/samvaya-logo-white.png" alt="Samvaya" width={140} height={32} priority />
      </div>

      {/* Progress */}
      <div className="px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-medium uppercase tracking-widest text-white/50">
            Progress
          </span>
          <span className="text-xs font-semibold text-white/60">{progress}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-white/60 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Section list — vertical stepper */}
      <nav className="flex-1 overflow-y-auto px-4 py-2" aria-label="Form sections">
        <ul>
          {SECTIONS.map((section, index) => {
            const status = getSectionCompletionStatus(section.id, state.answers);
            const isActive = state.currentSectionId === section.id;
            const isLast = index === SECTIONS.length - 1;

            const subGroups = getSubGroups(section.id);
            const showSubGroups = isActive && subGroups && subGroups.length >= 2;

            return (
              <li key={section.id} className="relative pb-8 last:pb-0">
                {/* Vertical connecting line */}
                {!isLast && (
                  <div className="absolute left-3 top-7 bottom-0 w-px">
                    <StepperLine status={status} isActive={isActive} />
                  </div>
                )}

                {/* Clickable row */}
                <button
                  onClick={() => {
                    navigateToSection(section.id);
                    onSectionClick?.();
                  }}
                  className="relative z-10 flex w-full items-center text-left"
                >
                  {/* Node */}
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center">
                    <StepperNode status={status} isActive={isActive} />
                  </div>

                  {/* Label */}
                  <span
                    className={`ml-3 text-xs leading-6 ${
                      status === 'complete'
                        ? 'font-medium text-white/80'
                        : isActive
                          ? 'font-bold text-white'
                          : status === 'partial'
                            ? 'font-medium text-white/70'
                            : 'text-white/55'
                    }`}
                  >
                    {section.label}
                  </span>
                </button>

                {/* Sub-group labels — active section only */}
                <div
                  className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                  style={{ gridTemplateRows: showSubGroups ? '1fr' : '0fr' }}
                >
                  <div className="overflow-hidden">
                    {subGroups && subGroups.length >= 2 && (
                      <ul className="ml-9 mt-2 space-y-1 border-l border-white/15 pl-3">
                        {subGroups.map((sg) => {
                          const isActiveSub =
                            isActive &&
                            currentQNum >= sg.questionRange[0] &&
                            currentQNum <= sg.questionRange[1];

                          return (
                            <li key={sg.label}>
                              <button
                                onClick={() => {
                                  const targetQId = state.visibleQuestions.find((qId) => {
                                    const q = getQuestion(qId);
                                    return (
                                      q &&
                                      q.questionNumber >= sg.questionRange[0] &&
                                      q.questionNumber <= sg.questionRange[1]
                                    );
                                  });
                                  if (targetQId) {
                                    const targetIdx = state.visibleQuestions.indexOf(targetQId);
                                    if (targetIdx >= 0) navigateTo(targetIdx);
                                    // Scroll to the question element after a brief delay for state to settle
                                    setTimeout(() => {
                                      document.getElementById(`q-${targetQId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                    }, 50);
                                  }
                                  onSectionClick?.();
                                }}
                                className={`block w-full py-1 text-left text-xs transition-colors ${
                                  isActiveSub
                                    ? 'font-medium text-white/90'
                                    : 'text-white/40 hover:text-white/60'
                                }`}
                              >
                                {sg.label}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Save status at bottom */}
      <div className="border-t border-white/[0.06] px-5 py-3">
        <SaveStatusBadge status={state.saveStatus} />
      </div>
    </div>
  );
}

// ============================================================
// Desktop sidebar
// ============================================================

export function SectionSidebar() {
  return (
    <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col lg:min-h-0 glass lg:overflow-hidden">
      <SidebarContent />
    </aside>
  );
}

// ============================================================
// Mobile drawer
// ============================================================

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileDrawer({ isOpen, onClose }: MobileDrawerProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 glass shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ background: 'rgba(13, 10, 11, 0.85)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)' }}
        role="dialog"
        aria-modal="true"
        aria-label="Form sections"
      >
        {/* Close button */}
        <div className="flex items-center justify-end px-4 pt-4">
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-white/50 hover:bg-white/10"
            aria-label="Close navigation"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <SidebarContent onSectionClick={onClose} />
      </div>
    </>
  );
}
