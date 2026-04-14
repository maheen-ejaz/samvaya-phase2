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
        <p className="form-caption mb-3">
          {selected.length} / {question.maxSelections} selected
        </p>
      )}
      <div className="form-chip-grid flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = selected.includes(option.value);
          const isDisabled =
            !isSelected &&
            question.maxSelections !== undefined &&
            selected.length >= question.maxSelections;
          // Wide chip for labels > 20 chars (full-width on mobile grid)
          const isWide = option.label.length > 20;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              data-selected={isSelected}
              className={`form-chip disabled:opacity-40 disabled:cursor-not-allowed ${isWide ? 'form-chip-wide' : ''}`}
            >
              {option.label}
              {isSelected && (
                <svg
                  viewBox="0 0 12 12"
                  className="form-chip-check"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="2 6.5 5 9.5 10 3" />
                </svg>
              )}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
