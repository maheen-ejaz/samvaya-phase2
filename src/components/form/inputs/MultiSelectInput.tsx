'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { TagInput } from './TagInput';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

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
            <Button
              key={option.value}
              type="button"
              variant={isSelected ? 'default' : 'outline'}
              onClick={() => toggle(option.value)}
              disabled={isDisabled}
              aria-pressed={isSelected}
              className={cn(
                'h-auto rounded-xl px-4 py-2.5 text-[14px] font-normal transition-all',
                isSelected && 'gap-1.5',
                option.label.length > 20 && 'w-full sm:w-auto',
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
