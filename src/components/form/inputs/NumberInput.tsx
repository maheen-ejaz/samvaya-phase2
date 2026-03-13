'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface NumberInputProps {
  question: QuestionConfig;
  value: number | string;
  onChange: (value: number | null) => void;
}

export function NumberInput({ question, value, onChange }: NumberInputProps) {
  return (
    <input
      type="number"
      value={value ?? ''}
      onChange={(e) => {
        const val = e.target.value;
        onChange(val === '' ? null : Number(val));
      }}
      placeholder={question.placeholder}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-samvaya-red focus:outline-none focus:ring-2 focus:ring-samvaya-red/20"
    />
  );
}
