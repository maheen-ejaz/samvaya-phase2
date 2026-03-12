'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface IllustratedMCInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function IllustratedMCInput({ question, value, onChange }: IllustratedMCInputProps) {
  if (!question.options) return null;

  const count = question.options.length;
  const gridCols = count === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <fieldset>
      <legend className="sr-only">{question.text}</legend>
      <div className={`grid ${gridCols} gap-3`}>
        {question.options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={`flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 transition-all ${
                isSelected
                  ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-500/20'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              {option.icon && (
                <span className="text-3xl" role="img" aria-hidden="true">
                  {option.icon}
                </span>
              )}
              <span className="text-center text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
