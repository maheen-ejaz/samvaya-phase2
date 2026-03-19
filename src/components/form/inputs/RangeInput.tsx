'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface RangeInputProps {
  question: QuestionConfig;
  value: [number | null, number | null];
  onChange: (value: [number | null, number | null]) => void;
}

const RANGE_CONSTRAINTS: Record<string, { min: number; max: number }> = {
  preferred_age_min: { min: 18, max: 60 },
  preferred_height_min_cm: { min: 100, max: 220 },
};

export function RangeInput({ question, value, onChange }: RangeInputProps) {
  const [min, max] = value || [null, null];
  const constraints = RANGE_CONSTRAINTS[question.targetColumn ?? ''];
  const hasError = min != null && max != null && min > max;

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="mb-1 block text-sm text-gray-500">Min</label>
          <input
            type="number"
            value={min ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              onChange([val, max]);
            }}
            min={constraints?.min}
            max={constraints?.max}
            placeholder={question.placeholder}
            className={`w-full rounded-lg border bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)] ${hasError ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-samvaya-red'}`}
          />
        </div>
        <span className="mt-6 text-gray-500" aria-hidden="true">—</span>
        <div className="flex-1">
          <label className="mb-1 block text-sm text-gray-500">Max</label>
          <input
            type="number"
            value={max ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              onChange([min, val]);
            }}
            min={constraints?.min}
            max={constraints?.max}
            className={`w-full rounded-lg border bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)] ${hasError ? 'border-red-400 focus:border-red-400' : 'border-gray-300 focus:border-samvaya-red'}`}
          />
        </div>
      </div>
      {hasError && (
        <p className="mt-1.5 text-sm text-red-600">Min must be less than or equal to max</p>
      )}
    </div>
  );
}
