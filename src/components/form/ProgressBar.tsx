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
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-rose-500 transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        />
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
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
          <svg className="h-3 w-3 animate-spin" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeDasharray="28" strokeDashoffset="8" /></svg>
          Saving…
        </span>
      );
    case 'saved':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600">
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3.5 8.5 6.5 11.5 12.5 5.5" /></svg>
          Saved
        </span>
      );
    case 'error':
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-0.5 text-xs text-red-600">
          <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M8 5v4M8 11h.01" /></svg>
          Save failed — will retry
        </span>
      );
    default:
      return null;
  }
}
