'use client';

import type { QuestionConfig } from '@/lib/form/types';
import { cn } from '@/lib/utils';
import { CheckIcon } from 'lucide-react';

interface StageSelectorProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function StageSelector({
  question,
  value,
  onChange,
  inputId,
  ariaDescribedBy,
  ariaInvalid,
}: StageSelectorProps) {
  if (!question.options) return null;
  const selectedIndex = question.options.findIndex((o) => o.value === value);

  return (
    <fieldset
      id={inputId}
      aria-describedby={ariaDescribedBy}
      aria-invalid={ariaInvalid || undefined}
      className="relative"
    >
      <legend className="sr-only">{question.text}</legend>
      <ol className="relative space-y-2">
        {question.options.map((option, index) => {
          const isSelected = value === option.value;
          const isPast = selectedIndex >= 0 && index < selectedIndex;
          const isLast = index === question.options!.length - 1;

          return (
            <li key={option.value} className="relative">
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute left-[1.125rem] top-10 h-[calc(100%-1rem)] w-px transition-colors',
                    isSelected || isPast ? 'bg-primary/40' : 'bg-border',
                  )}
                />
              )}
              <button
                type="button"
                onClick={() => onChange(option.value)}
                aria-pressed={isSelected}
                className={cn(
                  'group flex w-full items-center gap-4 rounded-xl border bg-transparent px-3 py-3 text-left transition-all',
                  'hover:border-primary/40 hover:bg-primary/5',
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/70',
                )}
              >
                <span
                  className={cn(
                    'relative z-10 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-sm font-medium transition-all',
                    isSelected
                      ? 'border-primary bg-primary text-primary-foreground'
                      : isPast
                        ? 'border-primary/40 bg-background text-primary/70'
                        : 'border-border bg-background text-muted-foreground',
                  )}
                >
                  {isSelected ? <CheckIcon className="size-4" /> : index + 1}
                </span>
                <span
                  className={cn(
                    'flex-1 text-[15px] leading-snug transition-colors',
                    isSelected
                      ? 'font-medium text-foreground'
                      : 'text-muted-foreground group-hover:text-foreground',
                  )}
                >
                  {option.label}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </fieldset>
  );
}
