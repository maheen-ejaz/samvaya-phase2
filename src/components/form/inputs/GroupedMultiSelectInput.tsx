'use client';

import { useState, useMemo } from 'react';
import type { QuestionConfig, OptionGroup } from '@/lib/form/types';
import { getCategoryIcon, ICON_PLUS } from '@/components/form/icons/line-icons';

interface GroupedMultiSelectInputProps {
  question: QuestionConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

export function GroupedMultiSelectInput({ question, value, onChange }: GroupedMultiSelectInputProps) {
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

  // Auto-expand groups that contain selected values on mount
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    for (const group of accordionGroups) {
      if (group.optionValues.some((v) => selected.includes(v))) {
        initial.add(group.key);
      }
    }
    // If nothing is selected, expand the first group
    if (initial.size === 0 && accordionGroups.length > 0) {
      initial.add(accordionGroups[0].key);
    }
    return initial;
  });

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

  return (
    <fieldset>
      <legend className="sr-only">{question.text}</legend>

      <div className="space-y-2">
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
                className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
              >
                <div className="flex items-center gap-2.5">
                  <span aria-hidden="true">
                    {getCategoryIcon(group.key) ?? <span className="text-xl">{group.icon}</span>}
                  </span>
                  <span className="text-base font-medium text-gray-900">{group.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedCount > 0 && (
                    <span className="rounded-full bg-samvaya-red/10 px-2 py-0.5 text-xs font-medium text-samvaya-red">
                      {selectedCount}
                    </span>
                  )}
                  <ChevronIcon expanded={isExpanded} />
                </div>
              </button>

              {/* Options as chips — visible when expanded */}
              {isExpanded && (
                <div className="mt-2 flex flex-wrap gap-2 px-1">
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
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                          isSelected
                            ? 'bg-samvaya-red text-white'
                            : isDisabled
                              ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {isSelected && (
                          <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        {/* Standalone "Other" option as chip */}
        {otherOption && (() => {
          const isOtherSelected = selected.includes(otherOption.value);
          const isOtherDisabled =
            !isOtherSelected &&
            question.maxSelections !== undefined &&
            selected.length >= question.maxSelections;
          return (
          <div className="mt-1 px-1">
            <button
              type="button"
              onClick={() => toggleOption(otherOption.value)}
              disabled={isOtherDisabled}
              aria-pressed={isOtherSelected}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                isOtherSelected
                  ? 'bg-samvaya-red text-white'
                  : isOtherDisabled
                    ? 'cursor-not-allowed bg-gray-100 text-gray-400 opacity-50'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {isOtherSelected ? (
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                <span aria-hidden="true">{ICON_PLUS}</span>
              )}
              <span>{otherOption.label}</span>
            </button>
          </div>
          );
        })()}
      </div>

      {/* Total selected summary */}
      <p className="mt-4 text-sm text-gray-500">
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
      className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  );
}
