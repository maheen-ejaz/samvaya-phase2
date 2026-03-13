'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface SelectInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function SelectInput({ question, value, onChange }: SelectInputProps) {
  if (!question.options) return null;

  // Use radio buttons for short option lists (≤ 6), dropdown for longer ones
  if (question.options.length <= 6) {
    return (
      <fieldset>
        <legend className="sr-only">{question.text}</legend>
        <div className="space-y-2">
          {question.options.map((option) => (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                value === option.value
                  ? 'border-samvaya-red bg-samvaya-red/10 text-gray-900'
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={() => onChange(option.value)}
                className="h-4 w-4 border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-base">{option.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  // Dropdown for longer lists
  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-samvaya-red focus:outline-none focus:ring-2 focus:ring-samvaya-red/20"
    >
      <option value="">Select an option</option>
      {question.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
