'use client';

import { useState, useCallback, useRef } from 'react';
import type { QuestionConfig, WorkExperienceEntry } from '@/lib/form/types';

interface TimelineInputProps {
  question: QuestionConfig;
  value: WorkExperienceEntry[] | unknown;
  onChange: (value: WorkExperienceEntry[]) => void;
}

const MAX_ENTRIES = 10;

const MONTHS = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 31 }, (_, i) => currentYear - i);

function createEmptyEntry(): WorkExperienceEntry {
  return {
    id: crypto.randomUUID(),
    org_name: '',
    designation: '',
    start_month: 0,
    start_year: 0,
    end_month: null,
    end_year: null,
    is_current: false,
  };
}

function coerceEntries(value: unknown): WorkExperienceEntry[] {
  if (!Array.isArray(value) || value.length === 0) {
    return [createEmptyEntry()];
  }
  return value.map((entry: Record<string, unknown>) => ({
    id: (entry.id as string) || crypto.randomUUID(),
    org_name: (entry.org_name as string) || '',
    designation: (entry.designation as string) || '',
    start_month: (entry.start_month as number) || 0,
    start_year: (entry.start_year as number) || 0,
    end_month: (entry.end_month as number) ?? null,
    end_year: (entry.end_year as number) ?? null,
    is_current: Boolean(entry.is_current),
  }));
}

/** Check if end date is before start date */
function isEndBeforeStart(entry: WorkExperienceEntry): boolean {
  if (entry.is_current || !entry.end_year || !entry.start_year) return false;
  if (entry.end_year < entry.start_year) return true;
  if (entry.end_year === entry.start_year && entry.end_month && entry.start_month) {
    return entry.end_month < entry.start_month;
  }
  return false;
}

export function TimelineInput({ value, onChange }: TimelineInputProps) {
  const [entries, setEntries] = useState<WorkExperienceEntry[]>(() => coerceEntries(value));
  const newEntryIdRef = useRef<string | null>(null);

  const propagate = useCallback(
    (updated: WorkExperienceEntry[]) => {
      setEntries(updated);
      onChange(updated);
    },
    [onChange],
  );

  const updateEntry = useCallback(
    (index: number, field: keyof WorkExperienceEntry, fieldValue: unknown) => {
      const updated = entries.map((entry, i) => {
        if (i !== index) return entry;
        const next = { ...entry, [field]: fieldValue };
        if (field === 'is_current' && fieldValue === true) {
          next.end_month = null;
          next.end_year = null;
        }
        return next;
      });
      propagate(updated);
    },
    [entries, propagate],
  );

  const addEntry = useCallback(() => {
    if (entries.length >= MAX_ENTRIES) return;
    const newEntry = createEmptyEntry();
    newEntryIdRef.current = newEntry.id;
    propagate([...entries, newEntry]);
  }, [entries, propagate]);

  const removeEntry = useCallback(
    (index: number) => {
      if (entries.length <= 1) return;
      propagate(entries.filter((_, i) => i !== index));
    },
    [entries, propagate],
  );

  return (
    <div className="space-y-4">
      {entries.map((entry, index) => {
        const dateError = isEndBeforeStart(entry);
        return (
          <div
            key={entry.id}
            className="relative rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-sm"
          >
            {/* Entry header with remove button */}
            <div className="mb-3 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Role {index + 1}
              </span>
              {entries.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeEntry(index)}
                  className="rounded-md p-1 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove role ${index + 1}`}
                  title={`Remove role ${index + 1}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              )}
            </div>

            {/* Organisation name */}
            <div className="mb-3">
              <label htmlFor={`org_${entry.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Organisation / Hospital
              </label>
              <input
                ref={(el) => {
                  if (el && newEntryIdRef.current === entry.id) {
                    el.focus();
                    newEntryIdRef.current = null;
                  }
                }}
                id={`org_${entry.id}`}
                type="text"
                defaultValue={entry.org_name}
                onBlur={(e) => updateEntry(index, 'org_name', e.target.value)}
                placeholder="e.g. AIIMS New Delhi"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
              />
            </div>

            {/* Designation */}
            <div className="mb-3">
              <label htmlFor={`desig_${entry.id}`} className="mb-1 block text-sm font-medium text-gray-700">
                Designation / Role
              </label>
              <input
                id={`desig_${entry.id}`}
                type="text"
                defaultValue={entry.designation}
                onBlur={(e) => updateEntry(index, 'designation', e.target.value)}
                placeholder="e.g. Senior Resident"
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
              />
            </div>

            {/* Start date */}
            <fieldset className="mb-3">
              <legend className="mb-1 text-sm font-medium text-gray-700">Start date</legend>
              <div className="grid grid-cols-2 gap-2">
                <select
                  id={`start_month_${entry.id}`}
                  aria-label="Start month"
                  value={entry.start_month || ''}
                  onChange={(e) => updateEntry(index, 'start_month', Number(e.target.value))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
                >
                  <option value="">Month</option>
                  {MONTHS.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </select>
                <select
                  id={`start_year_${entry.id}`}
                  aria-label="Start year"
                  value={entry.start_year || ''}
                  onChange={(e) => updateEntry(index, 'start_year', Number(e.target.value))}
                  className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
                >
                  <option value="">Year</option>
                  {YEARS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
            </fieldset>

            {/* Currently working here checkbox */}
            <div className="mb-3">
              <label className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={entry.is_current}
                  onChange={(e) => updateEntry(index, 'is_current', e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <span className="text-sm text-gray-700">I currently work here</span>
              </label>
            </div>

            {/* End date (hidden when is_current) */}
            {!entry.is_current && (
              <fieldset>
                <legend className="mb-1 text-sm font-medium text-gray-700">End date</legend>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    id={`end_month_${entry.id}`}
                    aria-label="End month"
                    value={entry.end_month ?? ''}
                    onChange={(e) =>
                      updateEntry(index, 'end_month', e.target.value ? Number(e.target.value) : null)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
                  >
                    <option value="">Month</option>
                    {MONTHS.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                  <select
                    id={`end_year_${entry.id}`}
                    aria-label="End year"
                    value={entry.end_year ?? ''}
                    onChange={(e) =>
                      updateEntry(index, 'end_year', e.target.value ? Number(e.target.value) : null)
                    }
                    className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
                  >
                    <option value="">Year</option>
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
                {dateError && (
                  <p className="mt-1 text-xs text-red-600">End date must be after start date</p>
                )}
              </fieldset>
            )}
          </div>
        );
      })}

      {/* Add another role button */}
      {entries.length < MAX_ENTRIES && (
        <button
          type="button"
          onClick={addEntry}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-3 text-sm font-medium text-gray-500 transition-colors hover:border-samvaya-red/40 hover:text-samvaya-red"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add another role
        </button>
      )}
    </div>
  );
}
