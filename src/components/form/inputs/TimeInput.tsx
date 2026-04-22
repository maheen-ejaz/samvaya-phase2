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
      className="form-input"
    />
  );
}
