'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface TimeInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function TimeInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: TimeInputProps) {
  return (
    <input
      id={inputId}
      type="time"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
    />
  );
}
