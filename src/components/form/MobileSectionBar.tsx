'use client';

import { useForm } from './FormProvider';
import { SECTIONS, getSectionIndex } from '@/lib/form/sections';
import { calculateOverallProgress } from '@/lib/form/section-navigation';

interface MobileSectionBarProps {
  onMenuOpen: () => void;
}

export function MobileSectionBar({ onMenuOpen }: MobileSectionBarProps) {
  const { state } = useForm();
  const sectionIndex = getSectionIndex(state.currentSectionId);
  const section = SECTIONS[sectionIndex];
  const progress = calculateOverallProgress(state.answers);

  return (
    <div className="fixed inset-x-0 top-0 z-30 glass lg:hidden">
      <div className="flex items-center justify-between px-4 py-3">
        {/* Hamburger */}
        <button
          onClick={onMenuOpen}
          className="rounded-lg p-1.5 text-white/60 hover:bg-white/10"
          aria-label="Open section menu"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        {/* Section label */}
        <span className="text-sm font-bold text-white">
          {section?.label ?? 'Form'}
        </span>

        {/* Save status */}
        <div className="w-16 text-right">
          <SaveStatusDot status={state.saveStatus} />
        </div>
      </div>

      {/* Thin progress bar */}
      <div className="h-0.5 w-full bg-white/10">
        <div
          className="h-full bg-white/60 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function SaveStatusDot({ status }: { status: string }) {
  switch (status) {
    case 'saving':
      return <span className="text-xs text-white/40">Saving...</span>;
    case 'saved':
      return (
        <span className="text-xs text-emerald-400/80">
          <svg className="inline h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </span>
      );
    case 'error':
      return <span className="text-xs text-red-400">Error</span>;
    default:
      return null;
  }
}
