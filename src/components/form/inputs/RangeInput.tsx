'use client';

import { useEffect, useState } from 'react';
import { Slider } from '@/components/ui/slider';
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
  preferred_age_min:        { min: 18,  max: 40  },
  preferred_height_min_cm:  { min: 140, max: 220 },
  preferred_weight_min_kg:  { min: 40,  max: 120 },
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

  const effectiveMin = min ?? constraints?.min ?? 0;
  const effectiveMax = max ?? constraints?.max ?? 100;

  // Seed the store with constraint defaults on first visit (no saved answer yet)
  useEffect(() => {
    if (constraints && (min === null || max === null)) {
      onChange([constraints.min, constraints.max]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Local raw state lets the user type freely; clamping happens on blur
  const [rawMin, setRawMin] = useState(String(effectiveMin));
  const [rawMax, setRawMax] = useState(String(effectiveMax));

  // Keep text inputs in sync when the slider moves
  useEffect(() => setRawMin(String(effectiveMin)), [effectiveMin]);
  useEffect(() => setRawMax(String(effectiveMax)), [effectiveMax]);

  const rangeErrorId = `${question.id}-range-error`;
  const minId = inputId ? `${inputId}-min` : `${question.id}-min`;
  const maxId = inputId ? `${inputId}-max` : `${question.id}-max`;
  const hasError = min != null && max != null && min > max;
  const minDescribedBy = [hasError ? rangeErrorId : '', ariaDescribedBy || ''].filter(Boolean).join(' ') || undefined;
  const maxDescribedBy = [hasError ? rangeErrorId : '', ariaDescribedBy || ''].filter(Boolean).join(' ') || undefined;
  const isInvalid = ariaInvalid || hasError || undefined;

  function handleSliderChange([newMin, newMax]: number[]) {
    onChange([newMin, newMax]);
  }

  function handleMinBlur() {
    const n = Number(rawMin);
    const clamped = isNaN(n) ? effectiveMin : Math.max(constraints?.min ?? 0, Math.min(n, effectiveMax));
    onChange([clamped, effectiveMax]);
    setRawMin(String(clamped));
  }

  function handleMaxBlur() {
    const n = Number(rawMax);
    const clamped = isNaN(n) ? effectiveMax : Math.min(constraints?.max ?? 100, Math.max(n, effectiveMin));
    onChange([effectiveMin, clamped]);
    setRawMax(String(clamped));
  }

  function formatRangeLabel(): string {
    if (isHeightField) {
      const minFt = cmToFeetInches(effectiveMin);
      const maxFt = cmToFeetInches(effectiveMax);
      return `${effectiveMin} cm${minFt ? ` (${minFt})` : ''} to ${effectiveMax} cm${maxFt ? ` (${maxFt})` : ''}`;
    }
    const unit = question.targetColumn?.includes('weight') ? ' kg'
               : question.targetColumn?.includes('age')    ? ' years'
               : '';
    return `${effectiveMin}${unit} to ${effectiveMax}${unit}`;
  }

  return (
    <div id={inputId}>
      {/* Live range label */}
      <p className="form-caption mb-4" aria-live="polite">
        {formatRangeLabel()}
      </p>

      {/* Dual-handle slider */}
      <div className="px-1 pb-2">
        <Slider
          min={constraints?.min}
          max={constraints?.max}
          step={1}
          value={[effectiveMin, effectiveMax]}
          onValueChange={handleSliderChange}
          minStepsBetweenThumbs={0}
          aria-label={question.text}
          thumbLabels={[`Minimum — ${question.text}`, `Maximum — ${question.text}`]}
          className="[&_[data-slot=slider-range]]:bg-[var(--color-form-accent)] [&_[data-slot=slider-thumb]]:border-[var(--color-form-accent)]"
        />
      </div>

      {/* Precise number inputs */}
      <div className="mt-4 flex items-end gap-3">
        <div className="flex-1">
          <label htmlFor={minId} className="form-helper mb-1.5 block">Min</label>
          <input
            id={minId}
            type="number"
            inputMode="decimal"
            value={rawMin}
            onChange={(e) => setRawMin(e.target.value)}
            onBlur={handleMinBlur}
            min={constraints?.min}
            max={constraints?.max}
            aria-describedby={minDescribedBy}
            aria-invalid={isInvalid}
            className="form-input"
          />
          {isHeightField && cmToFeetInches(effectiveMin) && (
            <p className="form-caption mt-1">{cmToFeetInches(effectiveMin)}</p>
          )}
        </div>
        <span className="form-caption pb-4" aria-hidden="true">—</span>
        <div className="flex-1">
          <label htmlFor={maxId} className="form-helper mb-1.5 block">Max</label>
          <input
            id={maxId}
            type="number"
            inputMode="decimal"
            value={rawMax}
            onChange={(e) => setRawMax(e.target.value)}
            onBlur={handleMaxBlur}
            min={constraints?.min}
            max={constraints?.max}
            aria-describedby={maxDescribedBy}
            aria-invalid={isInvalid}
            className="form-input"
          />
          {isHeightField && cmToFeetInches(effectiveMax) && (
            <p className="form-caption mt-1">{cmToFeetInches(effectiveMax)}</p>
          )}
        </div>
      </div>

      {hasError && (
        <p id={rangeErrorId} className="form-error mt-2">Min must be less than or equal to max</p>
      )}
    </div>
  );
}
