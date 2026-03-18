'use client';

import { useState } from 'react';
import type { QuestionConfig } from '@/lib/form/types';

interface TextInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function TextInput({ question, value, onChange, disabled }: TextInputProps) {
  const inputType = question.type === 'email' ? 'email' : question.type === 'phone' ? 'tel' : 'text';
  const isPhone = question.type === 'phone';
  const [touched, setTouched] = useState(false);

  // Phone: strip non-digits for length check
  const phoneDigits = isPhone ? (value || '').replace(/\D/g, '') : '';
  const showPhoneHint = isPhone && touched && phoneDigits.length > 0 && phoneDigits.length < 10;

  return (
    <div>
      <input
        type={inputType}
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={question.placeholder}
        disabled={disabled}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)] disabled:bg-gray-100 disabled:text-gray-400"
      />
      {showPhoneHint && (
        <p className="mt-1.5 text-sm text-amber-600">
          Please enter a valid phone number (at least 10 digits).
        </p>
      )}
    </div>
  );
}
