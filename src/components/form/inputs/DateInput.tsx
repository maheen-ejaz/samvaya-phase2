'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface DateInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function DateInput({ question, value, onChange }: DateInputProps) {
  // For date_of_birth (Q9), constrain to reasonable age range for medical professionals
  const isDateOfBirth = question.targetColumn === 'date_of_birth';
  const today = new Date();
  const minDate = isDateOfBirth
    ? `${today.getFullYear() - 55}-01-01`
    : undefined;
  const maxDate = isDateOfBirth
    ? `${today.getFullYear() - 22}-12-31`
    : undefined;

  return (
    <input
      type="date"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={question.placeholder}
      min={minDate}
      max={maxDate}
      className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
    />
  );
}
