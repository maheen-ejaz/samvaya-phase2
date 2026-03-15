'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { ComboboxInput } from './ComboboxInput';

interface SelectInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function SelectInput({ question, value, onChange }: SelectInputProps) {
  if (!question.options) return null;

  // Searchable combobox for longer lists (>6 options)
  if (question.options.length > 6) {
    return <ComboboxInput question={question} value={value} onChange={onChange} />;
  }

  // Chips for short option lists (≤ 6)
  return (
    <fieldset>
      <legend className="sr-only">{question.text}</legend>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isSelected
                  ? 'bg-samvaya-red text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isSelected && (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
