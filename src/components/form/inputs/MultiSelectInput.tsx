'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { TagInput } from './TagInput';
import { CheckIcon } from 'lucide-react';
import { NO_PREFERENCE_VALUE, applyNoPreferenceToggle } from '@/lib/form/no-preference';

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
  const hasNoPreference = question.options.some((o) => o.value === NO_PREFERENCE_VALUE);

  const exclusiveValues = new Set(
    (question.options ?? []).filter((o) => o.exclusive).map((o) => o.value)
  );

  function toggle(optionValue: string) {
    if (hasNoPreference) {
      const next = applyNoPreferenceToggle(selected, optionValue);
      if (
        optionValue !== NO_PREFERENCE_VALUE &&
        question.maxSelections &&
        next.length > question.maxSelections &&
        !selected.includes(optionValue)
      ) {
        return;
      }
      onChange(next);
      return;
    }

    // Exclusive option (e.g. "None currently"): selecting it clears all others;
    // selecting any other option clears all exclusive ones.
    if (exclusiveValues.size > 0) {
      if (exclusiveValues.has(optionValue)) {
        // Toggle exclusive: if already selected deselect it, else select only it
        onChange(selected.includes(optionValue) ? [] : [optionValue]);
        return;
      }
      // Non-exclusive: remove any currently-selected exclusive options
      const withoutExclusive = selected.filter((v) => !exclusiveValues.has(v));
      if (withoutExclusive.includes(optionValue)) {
        onChange(withoutExclusive.filter((v) => v !== optionValue));
      } else {
        if (question.maxSelections && withoutExclusive.length >= question.maxSelections) return;
        onChange([...withoutExclusive, optionValue]);
      }
      return;
    }

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
        <p className="mb-3 text-xs text-muted-foreground">
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
              data-selected={isSelected}
              onClick={() => toggle(option.value)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className="form-chip disabled:opacity-40 disabled:pointer-events-none"
            >
              {option.icon && <span aria-hidden="true">{option.icon}</span>}
              {option.label}
              {isSelected && <CheckIcon className="size-3.5" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
