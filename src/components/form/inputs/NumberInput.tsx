'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface NumberInputProps {
  question: QuestionConfig;
  value: number | string;
  onChange: (value: number | null) => void;
}

function cmToFeetInches(cm: number): string | null {
  if (cm < 50 || cm > 250) return null;
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) { feet += 1; inches = 0; }
  return `≈ ${feet}′ ${inches}″`;
}

export function NumberInput({ question, value, onChange }: NumberInputProps) {
  const isHeight = question.targetColumn === 'height_cm';
  const heightConversion = isHeight && typeof value === 'number' ? cmToFeetInches(value) : null;

  return (
    <div>
      <input
        type="number"
        value={value ?? ''}
        onChange={(e) => {
          const val = e.target.value;
          onChange(val === '' ? null : Number(val));
        }}
        placeholder={question.placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
      />
      {heightConversion && (
        <p className="mt-1.5 text-sm text-gray-500">{heightConversion}</p>
      )}
    </div>
  );
}
