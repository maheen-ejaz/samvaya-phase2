'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { ComboboxInput } from './ComboboxInput';

interface SelectInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function SelectInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: SelectInputProps) {
  if (!question.options) return null;

  // Searchable combobox for longer lists (>6 options)
  if (question.options.length > 6) {
    return <ComboboxInput question={question} value={value} onChange={onChange} inputId={inputId} ariaDescribedBy={ariaDescribedBy} ariaInvalid={ariaInvalid} />;
  }

  // Chips for short option lists (≤ 6)
  return (
    <fieldset id={inputId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid || undefined}>
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
              data-selected={isSelected}
              className="form-chip"
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
