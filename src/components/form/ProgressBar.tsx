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
            <span className="text-gray-400"> — {section.label}</span>
          )}
        </span>
        <span className="text-gray-400">{progress}%</span>
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
      return <span className="text-xs text-gray-400">Saving...</span>;
    case 'saved':
      return <span className="text-xs text-green-500">Saved</span>;
    case 'error':
      return <span className="text-xs text-red-500">Save failed — will retry</span>;
    default:
      return null;
  }
}
