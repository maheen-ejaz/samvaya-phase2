'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { getLineIcon } from '@/components/form/icons/line-icons';

interface IllustratedMCInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function IllustratedMCInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: IllustratedMCInputProps) {
  if (!question.options) return null;

  return (
    <fieldset id={inputId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid || undefined}>
      <legend className="sr-only">{question.text}</legend>
      <div className="flex flex-wrap gap-2">
        {question.options.map((option) => {
          const isSelected = value === option.value;
          const svgIcon = getLineIcon(question.id, option.value);

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              data-selected={isSelected}
              onClick={() => onChange(option.value)}
              className="form-chip"
            >
              {svgIcon ? (
                <span role="img" aria-hidden="true" className="[&_svg]:size-[18px]">
                  {svgIcon}
                </span>
              ) : option.icon ? (
                <span role="img" aria-hidden="true">{option.icon}</span>
              ) : null}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
