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

  const count = question.options.length;
  const gridCols = count === 3 ? 'grid-cols-3' : 'grid-cols-2';

  return (
    <fieldset id={inputId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid || undefined}>
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
              data-selected={isSelected}
              onClick={() => onChange(option.value)}
              className="form-chip flex-col gap-3 px-3 py-5 min-h-[6.5rem]"
            >
              {svgIcon ? (
                <span role="img" aria-hidden="true" className="text-2xl">
                  {svgIcon}
                </span>
              ) : option.icon ? (
                <span className="text-3xl" role="img" aria-hidden="true">
                  {option.icon}
                </span>
              ) : null}
              <span className="text-center text-[14px] leading-tight">{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
