'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface RangeInputProps {
  question: QuestionConfig;
  value: [number | null, number | null];
  onChange: (value: [number | null, number | null]) => void;
}

export function RangeInput({ question, value, onChange }: RangeInputProps) {
  const [min, max] = value || [null, null];

  return (
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
          placeholder={question.placeholder}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        />
      </div>
      <span className="mt-6 text-gray-400">—</span>
      <div className="flex-1">
        <label className="mb-1 block text-sm text-gray-500">Max</label>
        <input
          type="number"
          value={max ?? ''}
          onChange={(e) => {
            const val = e.target.value === '' ? null : Number(e.target.value);
            onChange([min, val]);
          }}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
        />
      </div>
    </div>
  );
}
