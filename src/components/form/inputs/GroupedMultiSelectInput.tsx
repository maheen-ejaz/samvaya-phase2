'use client';

import { useState, useMemo } from 'react';
import type { QuestionConfig, OptionGroup } from '@/lib/form/types';
import { getCategoryIcon, ICON_PLUS } from '@/components/form/icons/line-icons';

interface GroupedMultiSelectInputProps {
  question: QuestionConfig;
  value: string[];
  onChange: (value: string[]) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function GroupedMultiSelectInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: GroupedMultiSelectInputProps) {
  const selected = value || [];
  const groups = question.optionGroups || [];
  const optionsMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const opt of question.options || []) {
      map.set(opt.value, opt.label);
    }
    return map;
  }, [question.options]);

  // "Other" is rendered standalone — separate it from accordion groups
  const accordionGroups = groups.filter((g) => g.key !== 'other');
  const otherOption = (question.options || []).find((o) => o.value === 'other');

  // All groups start expanded so users can immediately see the available options
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    () => new Set(accordionGroups.map((g) => g.key))
  );

  function toggleGroup(groupKey: string) {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupKey)) {
        next.delete(groupKey);
      } else {
        next.add(groupKey);
      }
      return next;
    });
  }

  function toggleOption(optionValue: string) {
    if (selected.includes(optionValue)) {
      onChange(selected.filter((v) => v !== optionValue));
    } else {
      if (question.maxSelections && selected.length >= question.maxSelections) {
        return;
      }
      onChange([...selected, optionValue]);
    }
  }

  function countSelected(group: OptionGroup): number {
    return group.optionValues.filter((v) => selected.includes(v)).length;
  }

  const limit = question.maxSelections;
  const atLimit = limit !== undefined && selected.length >= limit;

  return (
    <fieldset id={inputId} aria-describedby={ariaDescribedBy} aria-invalid={ariaInvalid || undefined}>
      <legend className="sr-only">{question.text}</legend>

      {limit !== undefined && (
        <div
          className={`mb-3 flex items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-sm ${
            atLimit
              ? 'border-[color:var(--color-samvaya-red)]/40 bg-[color:var(--color-samvaya-red)]/5 text-[color:var(--color-samvaya-red)]'
              : 'border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] text-[color:var(--color-form-text-secondary)]'
          }`}
          role="status"
          aria-live="polite"
        >
          <span>
            {atLimit
              ? `Maximum reached — you've selected ${limit}.`
              : `Choose up to ${limit}.`}
          </span>
          <span className="font-medium tabular-nums">
            {selected.length} / {limit}
          </span>
        </div>
      )}

      <div className="space-y-2">
        {/* Standalone "Other" option as chip — rendered above the accordion groups
            so users with niche qualifications see it first. */}
        {otherOption && (() => {
          const isOtherSelected = selected.includes(otherOption.value);
          const isOtherDisabled =
            !isOtherSelected &&
            question.maxSelections !== undefined &&
            selected.length >= question.maxSelections;
          return (
          <div className="px-1 pb-1">
            <button
              type="button"
              onClick={() => toggleOption(otherOption.value)}
              disabled={isOtherDisabled}
              aria-pressed={isOtherSelected}
              data-selected={isOtherSelected}
              className="form-chip disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {!isOtherSelected && <span aria-hidden="true">{ICON_PLUS}</span>}
              <span>{otherOption.label}</span>
            </button>
          </div>
          );
        })()}

        {accordionGroups.map((group) => {
          const isExpanded = expandedGroups.has(group.key);
          const selectedCount = countSelected(group);

          return (
            <div key={group.key}>
              {/* Category header */}
              <button
                type="button"
                onClick={() => toggleGroup(group.key)}
                aria-expanded={isExpanded}
                className="flex w-full items-center justify-between rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-4 py-3.5 text-left transition-colors hover:border-[color:var(--color-form-border-strong)]"
              >
                <div className="flex items-center gap-3">
                  <span aria-hidden="true">
                    {getCategoryIcon(group.key) ?? <span className="text-xl">{group.icon}</span>}
                  </span>
                  <span className="form-label">{group.label}</span>
                </div>
                <div className="flex items-center gap-3">
                  {selectedCount > 0 && (
                    <span className="rounded-full bg-[color:var(--color-samvaya-red)]/10 px-2 py-0.5 text-[12px] font-medium text-[color:var(--color-samvaya-red)]">
                      {selectedCount}
                    </span>
                  )}
                  <ChevronIcon expanded={isExpanded} />
                </div>
              </button>

              {/* Options as chips — visible when expanded */}
              {isExpanded && (
                <div className="mt-3 flex flex-wrap gap-2 px-1">
                  {group.optionValues.map((optValue) => {
                    const label = optionsMap.get(optValue) || optValue;
                    const isSelected = selected.includes(optValue);
                    const isDisabled =
                      !isSelected &&
                      question.maxSelections !== undefined &&
                      selected.length >= question.maxSelections;

                    return (
                      <button
                        key={optValue}
                        type="button"
                        onClick={() => toggleOption(optValue)}
                        disabled={isDisabled}
                        aria-pressed={isSelected}
                        data-selected={isSelected}
                        className="form-chip disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

      </div>

      {/* Total selected summary */}
      <p className="form-caption mt-4">
        {selected.length === 0
          ? 'No items selected yet'
          : question.maxSelections
            ? `${selected.length} / ${question.maxSelections} selected`
            : `${selected.length} ${selected.length === 1 ? 'item' : 'items'} selected`}
      </p>
    </fieldset>
  );
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`h-4 w-4 text-[color:var(--color-form-text-tertiary)] transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
