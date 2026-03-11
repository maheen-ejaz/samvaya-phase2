'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface TimelineInputProps {
  question: QuestionConfig;
}

export function TimelineInput({ question }: TimelineInputProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <p className="text-gray-500">
        Work experience timeline for &ldquo;{question.text}&rdquo; will be available soon.
      </p>
      <p className="mt-1 text-sm text-gray-400">
        This feature is being built in a later phase.
      </p>
    </div>
  );
}
