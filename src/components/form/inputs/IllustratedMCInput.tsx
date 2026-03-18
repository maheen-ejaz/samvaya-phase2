'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { getLineIcon } from '@/components/form/icons/line-icons';

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
          const svgIcon = getLineIcon(question.id, option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={`relative flex flex-col items-center justify-center gap-2 rounded-xl border-2 px-3 py-4 transition-all duration-200 active:scale-[0.97] ${
                isSelected
                  ? 'border-samvaya-red bg-samvaya-red/10 text-gray-900 ring-1 ring-samvaya-red/20 shadow-[0_0_0_3px_rgba(163,23,31,0.1)]'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm'
              }`}
            >
              {/* Selection checkmark */}
              {isSelected && (
                <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-samvaya-red animate-scale-in">
                  <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                  </svg>
                </div>
              )}
              {svgIcon ? (
                <span role="img" aria-hidden="true">{svgIcon}</span>
              ) : option.icon ? (
                <span className="text-3xl" role="img" aria-hidden="true">
                  {option.icon}
                </span>
              ) : null}
              <span className="text-center text-sm font-medium">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
