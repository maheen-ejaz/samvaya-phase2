'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface DateInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function DateInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: DateInputProps) {
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
        id={inputId}
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={question.placeholder}
        min={minDate}
        max={maxDate}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        className="form-input"
      />
      {age !== null && age > 0 && (
        <p className="form-helper mt-2">
          Age: <span className="text-[color:var(--color-form-text-primary)] font-medium">{age} years</span>
        </p>
      )}
    </div>
  );
}
