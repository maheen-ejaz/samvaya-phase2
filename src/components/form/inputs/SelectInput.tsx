'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { ComboboxInput } from './ComboboxInput';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

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
            <Button
              key={option.value}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => onChange(option.value)}
              aria-pressed={isSelected}
              className={cn(
                'h-auto rounded-xl px-4 py-2.5 text-[14px] font-normal transition-all',
                isSelected && 'gap-1.5',
              )}
            >
              {option.label}
              {isSelected && <CheckIcon className="size-3.5" />}
            </Button>
          );
        })}
      </div>
    </fieldset>
  );
}
