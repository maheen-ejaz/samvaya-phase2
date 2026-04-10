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
              data-selected={isSelected}
              className="form-chip disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
