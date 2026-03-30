'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface NumberInputProps {
  question: QuestionConfig;
  value: number | string;
  onChange: (value: number | null) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

const NUMBER_CONSTRAINTS: Record<string, { min: number; max: number; step: number }> = {
  height_cm: { min: 100, max: 250, step: 1 },
  weight_kg: { min: 30, max: 250, step: 1 },
  siblings_count: { min: 0, max: 20, step: 1 },
};

function cmToFeetInches(cm: number): string | null {
  if (cm < 50 || cm > 250) return null;
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) { feet += 1; inches = 0; }
  return `≈ ${feet}′ ${inches}″`;
}

export function NumberInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: NumberInputProps) {
  const isHeight = question.targetColumn === 'height_cm';
  const heightConversion = isHeight && typeof value === 'number' ? cmToFeetInches(value) : null;
  const constraints = NUMBER_CONSTRAINTS[question.targetColumn ?? ''];

  return (
    <div>
      <input
        id={inputId}
        type="number"
        value={value ?? ''}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        onChange={(e) => {
          const val = e.target.value;
          if (val === '') { onChange(null); return; }
          let num = Number(val);
          if (constraints) {
            num = Math.max(constraints.min, Math.min(constraints.max, num));
          }
          onChange(num);
        }}
        min={constraints?.min}
        max={constraints?.max}
        step={constraints?.step}
        placeholder={question.placeholder}
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
      />
      {heightConversion && (
        <p className="mt-1.5 text-sm text-gray-500">{heightConversion}</p>
      )}
    </div>
  );
}
