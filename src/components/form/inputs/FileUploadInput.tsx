'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface FileUploadInputProps {
  question: QuestionConfig;
}

export function FileUploadInput({ question }: FileUploadInputProps) {
  return (
    <div className="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center">
      <p className="text-gray-500">
        File upload for &ldquo;{question.text}&rdquo; will be available soon.
      </p>
      <p className="mt-1 text-sm text-gray-400">
        This feature is being built in a later phase.
      </p>
    </div>
  );
}
