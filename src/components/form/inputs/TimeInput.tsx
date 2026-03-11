'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface TimeInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function TimeInput({ question, value, onChange }: TimeInputProps) {
  return (
    <input
      type="time"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
    />
  );
}
