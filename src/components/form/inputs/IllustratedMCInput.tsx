'use client';

import { useRef, type KeyboardEvent } from 'react';
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
  const legendId = `${inputId ?? question.id}-legend`;
  const buttonsRef = useRef<Array<HTMLButtonElement | null>>([]);

  if (!question.options) return null;
  const options = question.options;

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = options.length - 1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = index === last ? 0 : index + 1;
      const opt = options[next];
      onChange(opt.value);
      buttonsRef.current[next]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prev = index === 0 ? last : index - 1;
      const opt = options[prev];
      onChange(opt.value);
      buttonsRef.current[prev]?.focus();
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(options[index].value);
    }
  }

  const selectedIndex = options.findIndex((o) => o.value === value);
  const tabStopIndex = selectedIndex >= 0 ? selectedIndex : 0;

  return (
    <fieldset
      id={inputId}
      role="radiogroup"
      aria-labelledby={legendId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
    >
      <legend id={legendId} className="sr-only">{question.text}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((option, index) => {
          const isSelected = value === option.value;
          const svgIcon = getLineIcon(question.id, option.value);

          return (
            <button
              key={option.value}
              ref={(el) => { buttonsRef.current[index] = el; }}
              type="button"
              role="radio"
              aria-checked={isSelected}
              tabIndex={index === tabStopIndex ? 0 : -1}
              data-selected={isSelected}
              onClick={() => onChange(option.value)}
              onKeyDown={(e) => handleKeyDown(e, index)}
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
