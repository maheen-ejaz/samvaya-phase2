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

  // Calculate age for date of birth
  let age: number | null = null;
  if (isDateOfBirth && value) {
    const birth = new Date(value);
    const diff = today.getFullYear() - birth.getFullYear();
    const hadBirthday =
      today.getMonth() > birth.getMonth() ||
      (today.getMonth() === birth.getMonth() && today.getDate() >= birth.getDate());
    age = hadBirthday ? diff : diff - 1;
  }

  return (
    <div>
      <input
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        min={minDate}
        max={maxDate}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-samvaya-red focus:outline-none focus:ring-2 focus:ring-samvaya-red/20"
      />
      {age !== null && age > 0 && (
        <p className="mt-2 text-sm text-gray-600">
          Age: <span className="font-medium text-gray-900">{age} years</span>
        </p>
      )}
    </div>
  );
}
