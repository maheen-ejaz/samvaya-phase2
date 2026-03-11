'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface ChatPlaceholderProps {
  question: QuestionConfig;
  onComplete: () => void;
}

export function ChatPlaceholder({ question, onComplete }: ChatPlaceholderProps) {
  const chatLabel =
    question.id === 'Q38'
      ? 'Family Background'
      : question.id === 'Q75'
        ? 'Goals & Values'
        : 'Closing Thoughts';

  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-rose-100">
        <svg
          className="h-6 w-6 text-rose-600"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-gray-900">
        AI Conversation: {chatLabel}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        This conversation with our AI will be available soon.
      </p>
      <button
        onClick={onComplete}
        className="mt-4 rounded-lg bg-rose-600 px-6 py-2 text-sm font-medium text-white hover:bg-rose-700 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
      >
        Skip for now
      </button>
    </div>
  );
}
