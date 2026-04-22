'use client';

import type { QuestionConfig } from '@/lib/form/types';

interface RangeInputProps {
  question: QuestionConfig;
  value: [number | null, number | null];
  onChange: (value: [number | null, number | null]) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

const RANGE_CONSTRAINTS: Record<string, { min: number; max: number }> = {
  preferred_age_min: { min: 18, max: 60 },
  preferred_height_min_cm: { min: 100, max: 220 },
  preferred_weight_min_kg: { min: 40, max: 140 },
};

const HEIGHT_COLUMNS = new Set(['preferred_height_min_cm', 'preferred_height_max_cm']);

function cmToFeetInches(cm: number): string | null {
  if (cm < 50 || cm > 250) return null;
  const totalInches = cm / 2.54;
  let feet = Math.floor(totalInches / 12);
  let inches = Math.round(totalInches % 12);
  if (inches === 12) { feet += 1; inches = 0; }
  return `≈ ${feet}′ ${inches}″`;
}

export function RangeInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: RangeInputProps) {
  const [min, max] = value || [null, null];
  const isHeightField = HEIGHT_COLUMNS.has(question.targetColumn ?? '') || HEIGHT_COLUMNS.has(question.targetColumn2 ?? '');
  const constraints = RANGE_CONSTRAINTS[question.targetColumn ?? ''];
  const hasError = min != null && max != null && min > max;
  const rangeErrorId = `${question.id}-range-error`;
  const minId = inputId ? `${inputId}-min` : `${question.id}-min`;
  const maxId = inputId ? `${inputId}-max` : `${question.id}-max`;

  // Merge external aria-describedby with internal error id
  const minDescribedBy = [hasError ? rangeErrorId : '', ariaDescribedBy || ''].filter(Boolean).join(' ') || undefined;
  const maxDescribedBy = [hasError ? rangeErrorId : '', ariaDescribedBy || ''].filter(Boolean).join(' ') || undefined;
  const isInvalid = ariaInvalid || hasError || undefined;

  return (
    <div id={inputId}>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor={minId} className="form-helper mb-1.5 block">Min</label>
          <input
            id={minId}
            type="number"
            inputMode="decimal"
            value={min ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              onChange([val, max]);
            }}
            min={constraints?.min}
            max={constraints?.max}
            placeholder={question.placeholder}
            aria-describedby={minDescribedBy}
            aria-invalid={isInvalid}
            className="form-input"
          />
          {isHeightField && min != null && cmToFeetInches(min) && (
            <p className="form-caption mt-1">{cmToFeetInches(min)}</p>
          )}
        </div>
        <span className="form-caption pb-4" aria-hidden="true">—</span>
        <div className="flex-1">
          <label htmlFor={maxId} className="form-helper mb-1.5 block">Max</label>
          <input
            id={maxId}
            type="number"
            inputMode="decimal"
            value={max ?? ''}
            onChange={(e) => {
              const val = e.target.value === '' ? null : Number(e.target.value);
              onChange([min, val]);
            }}
            min={constraints?.min}
            max={constraints?.max}
            aria-describedby={maxDescribedBy}
            aria-invalid={isInvalid}
            className="form-input"
          />
          {isHeightField && max != null && cmToFeetInches(max) && (
            <p className="form-caption mt-1">{cmToFeetInches(max)}</p>
          )}
        </div>
      </div>
      {hasError && (
        <p id={rangeErrorId} className="form-error mt-2">Min must be less than or equal to max</p>
      )}
    </div>
  );
}
