'use client';

import { useForm } from './FormProvider';
import { getCurrentSection, calculateProgress } from '@/lib/form/navigation';
import { getSectionIndex, SECTIONS } from '@/lib/form/sections';

export function ProgressBar() {
  const { state } = useForm();
  const currentId = state.visibleQuestions[state.currentQuestionIndex];
  const section = currentId ? getCurrentSection(currentId) : undefined;

  const sectionNumber = section ? getSectionIndex(section.id) + 1 : 1;
  const progress = calculateProgress(
    state.currentQuestionIndex,
    state.visibleQuestions.length
  );

  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">
          Section {sectionNumber} of {SECTIONS.length}
          {section && (
            <span className="text-gray-500"> — {section.label}</span>
          )}
        </span>
        <span className="text-gray-500">{progress}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="relative h-full overflow-hidden rounded-full bg-gradient-to-r from-samvaya-red to-rose-400 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        >
          <div className="absolute inset-0 animate-shimmer" />
        </div>
      </div>

      {/* Save status indicator */}
      <div className="mt-1.5 flex justify-end" aria-live="polite" aria-atomic="true">
        <SaveStatusBadge status={state.saveStatus} />
      </div>
    </div>
  );
}

function SaveStatusBadge({ status }: { status: string }) {
  switch (status) {
    case 'saving':
      return (
        <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
          <svg className="h-3.5 w-3.5 animate-spin" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" /></svg>
          Saving…
        </span>
      );
    case 'saved':
      return (
        <span className="animate-fade-in inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-500">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3.5 8.5 6.5 11.5 12.5 5.5" /></svg>
          Saved
        </span>
      );
    case 'error':
      return (
        <span className="animate-shake inline-flex items-center gap-1.5 rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-700">
          <svg className="h-3.5 w-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M8 5v4M8 11h.01" /></svg>
          Save failed — will retry
        </span>
      );
    default:
      return null;
  }
}
