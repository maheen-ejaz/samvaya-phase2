'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { TagInput } from './TagInput';

interface MultiSelectInputProps {
  question: QuestionConfig;
  value: string[];
  onChange: (value: string[]) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function MultiSelectInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: MultiSelectInputProps) {
  if (!question.options) return null;

  // Searchable tag input for longer lists (>6 options)
  if (question.options.length > 6) {
    return <TagInput question={question} value={value} onChange={onChange} inputId={inputId} ariaDescribedBy={ariaDescribedBy} ariaInvalid={ariaInvalid} />;
  }

  const selected = value || [];

  function toggle(optionValue: string) {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      if (question.maxSelections && selected.length >= question.maxSelections) {
        return;
      }
      onChange([...selected, optionValue]);
    }
  }

  return (
    <fieldset id={inputId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid || undefined}>
      <legend className="sr-only">{question.text}</legend>
      {question.maxSelections && (
        <p className="mb-2 text-sm text-gray-500">
          {selected.length} / {question.maxSelections} selected
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled =
            !isSelected &&
            question.maxSelections !== undefined &&
            selected.length >= question.maxSelections;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:ring-2 focus-visible:ring-rose-500/30 focus-visible:ring-offset-1 ${
                isSelected
                  ? 'bg-samvaya-red text-white'
                  : isDisabled
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50'
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
