'use client';

import { useState, useEffect } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface NumberInputProps {
  question: QuestionConfig;
  value: number | string;
  onChange: (value: number | null) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

const NUMBER_CONSTRAINTS: Record<string, { min: number; max: number; step: number }> = {
  height_cm: { min: 100, max: 250, step: 1 },
  weight_kg: { min: 30, max: 250, step: 1 },
  siblings_count: { min: 0, max: 20, step: 1 },
};

function cmToFeetInches(cm: number): string | null {
  if (cm < 50 || cm > 250) return null;
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) { feet += 1; inches = 0; }
  return `≈ ${feet}′ ${inches}″`;
}

export function NumberInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: NumberInputProps) {
  const constraints = NUMBER_CONSTRAINTS[question.targetColumn ?? ''];
  const [raw, setRaw] = useState<string>(value != null ? String(value) : '');

  // Sync raw when value changes externally (e.g. save-and-resume)
  useEffect(() => {
    setRaw(value != null ? String(value) : '');
  }, [value]);

  const isHeight = question.targetColumn === 'height_cm';
  const numericValue = typeof value === 'number' ? value : (value !== '' ? Number(value) : null);
  const heightConversion = isHeight && numericValue != null && !isNaN(numericValue) ? cmToFeetInches(numericValue) : null;

  return (
    <div>
      <Input
        id={inputId}
        type="number"
        inputMode="decimal"
        value={raw}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        onChange={(e) => {
          const val = e.target.value;
          setRaw(val);
          if (val === '') { onChange(null); return; }
          const num = Number(val);
          if (!isNaN(num)) onChange(num);
        }}
        onBlur={() => {
          if (raw === '') { onChange(null); return; }
          let num = Number(raw);
          if (isNaN(num)) return;
          if (constraints) {
            num = Math.max(constraints.min, Math.min(constraints.max, num));
          }
          setRaw(String(num));
          onChange(num);
        }}
        min={constraints?.min}
        max={constraints?.max}
        step={constraints?.step}
        placeholder={question.placeholder}
        className={cn(
          'h-11 rounded-xl border-input bg-transparent px-4 text-[15px]',
          'focus-visible:ring-primary/30',
        )}
      />
      {heightConversion && (
        <p className="mt-2 text-sm text-muted-foreground">{heightConversion}</p>
      )}
    </div>
  );
}
