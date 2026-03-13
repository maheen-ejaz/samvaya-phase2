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
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-samvaya-red focus:outline-none focus:ring-2 focus:ring-samvaya-red/20"
    />
  );
}
