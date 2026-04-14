'use client';

import { useState } from 'react';
import type { QuestionConfig } from '@/lib/form/types';

interface TextInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function TextInput({ question, value, onChange, disabled, inputId, ariaDescribedBy, ariaInvalid }: TextInputProps) {
  const inputType = question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text';
  const isPhone = question.type === 'phone';
  const [touched, setTouched] = useState(false);

  // Phone: strip non-digits for length check
  const phoneDigits = isPhone ? (value || '').replace(/\D/g, '') : '';
  const showPhoneHint = isPhone && touched && phoneDigits.length > 0 && phoneDigits.length < 10;

  // Map targetColumn → autocomplete hint for iOS/Android autofill
  const autocompleteMap: Record<string, string> = {
    first_name: 'given-name',
    last_name: 'family-name',
    email: 'email',
    phone: 'tel',
  };
  const autocomplete = question.targetColumn ? (autocompleteMap[question.targetColumn] ?? 'off') : undefined;

  return (
    <div>
      <input
        id={inputId}
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={question.placeholder}
        disabled={disabled}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        autoComplete={autocomplete}
        className="form-input"
      />
      {showPhoneHint && (
        <p className="form-helper mt-2 text-[color:var(--color-form-error)]">
          Please enter a valid phone number (at least 10 digits).
        </p>
      )}
    </div>
  );
}
