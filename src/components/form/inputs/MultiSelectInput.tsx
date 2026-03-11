'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface MultiSelectInputProps {
  question: QuestionConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

export function MultiSelectInput({ question, value, onChange }: MultiSelectInputProps) {
  if (!question.options) return null;

  const selected = value || [];

  function toggle(optionValue: string) {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      // Enforce maxSelections if set
      if (question.maxSelections && selected.length >= question.maxSelections) {
        return;
      }
      onChange([...selected, optionValue]);
    }
  }

  return (
    <div>
      {question.maxSelections && (
        <p className="mb-2 text-sm text-gray-500">
          {selected.length} / {question.maxSelections} selected
        </p>
      )}
      <div className="space-y-2">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled =
            !isSelected &&
            question.maxSelections !== undefined &&
            selected.length >= question.maxSelections;

          return (
            <label
              key={option.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                isSelected
                  ? 'border-rose-500 bg-rose-50 text-rose-900'
                  : isDisabled
                    ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-400'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => toggle(option.value)}
                disabled={isDisabled}
                className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
              />
              <span className="text-base">{option.label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
