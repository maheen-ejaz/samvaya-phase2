'use client';

import { SECTIONS } from '@/lib/form/sections';
import { getSectionCompletionStatus, calculateOverallProgress } from '@/lib/form/section-navigation';
import { useForm } from './FormProvider';
import type { SectionConfig } from '@/lib/form/types';
import type { SectionStatus } from '@/lib/form/section-navigation';

// ============================================================
// Completion indicator icon
// ============================================================

function CompletionIcon({ status }: { status: SectionStatus }) {
  if (status === 'complete') {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-samvaya-red">
        <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
        </svg>
      </div>
    );
  }

  if (status === 'partial') {
    return (
      <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-samvaya-red/60">
        <div className="h-2 w-2 rounded-full bg-samvaya-red" />
      </div>
    );
  }

  // empty
  return (
    <div className="h-6 w-6 shrink-0 rounded-full border border-white/30" />
  );
}

// ============================================================
// Save status badge
// ============================================================

function SaveStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'saving':
      return <span className="text-xs text-white/40">Saving...</span>;
    case 'saved':
      return <span className="text-xs text-emerald-400/80">Saved</span>;
    case 'error':
      return <span className="text-xs text-red-400">Save failed</span>;
    default:
      return null;
  }
}

// ============================================================
// Section list item
// ============================================================

interface SectionItemProps {
  section: SectionConfig;
  status: SectionStatus;
  isActive: boolean;
  onClick: () => void;
}

function SectionItem({ section, status, isActive, onClick }: SectionItemProps) {
  return (
    <button
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
        isActive
          ? 'bg-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.1)]'
          : 'hover:bg-white/[0.04]'
      }`}
    >
      <CompletionIcon status={status} />
      <span
        className={`text-sm leading-tight tracking-wide ${
          isActive ? 'font-bold text-white' : 'font-medium text-white/60'
        }`}
      >
        {section.label}
      </span>
    </button>
  );
}

// ============================================================
// Sidebar content (shared between desktop + mobile drawer)
// ============================================================

interface SidebarContentProps {
  onSectionClick?: () => void; // used by mobile drawer to close on click
}

export function SidebarContent({ onSectionClick }: SidebarContentProps) {
  const { state, navigateToSection } = useForm();
  const progress = calculateOverallProgress(state.answers);

  return (
    <div className="flex h-full flex-col">
      {/* Brand mark */}
      <div className="px-5 pt-6 pb-2">
        <h1 className="text-lg font-bold tracking-wider text-white">Samvaya</h1>
      </div>

      {/* Progress */}
      <div className="px-5 py-4">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-[11px] font-medium uppercase tracking-widest text-white/40">
            Progress
          </span>
          <span className="text-xs font-medium text-white/50">{progress}%</span>
        </div>
        <div className="h-1 w-full overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-samvaya-red transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Section list */}
      <nav className="flex-1 overflow-y-auto px-3 py-2" aria-label="Form sections">
        <ul className="space-y-0.5">
          {SECTIONS.map((section) => {
            const status = getSectionCompletionStatus(section.id, state.answers);
            const isActive = state.currentSectionId === section.id;

            return (
              <li key={section.id}>
                <SectionItem
                  section={section}
                  status={status}
                  isActive={isActive}
                  onClick={() => {
                    navigateToSection(section.id);
                    onSectionClick?.();
                  }}
                />
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
    <aside className="hidden lg:flex lg:w-72 lg:shrink-0 lg:flex-col glass lg:overflow-y-auto">
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
