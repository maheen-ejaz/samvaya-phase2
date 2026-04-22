'use client';

import { useState, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { INDIAN_STATES } from '@/lib/data/indian-states';
import { useCountries } from '@/lib/data/use-location-data';

export interface DualLocationValue {
  states: string[];
  countries: string[];
  noPreference: boolean;
}

interface DualLocationInputProps {
  question: QuestionConfig;
  value: DualLocationValue | null;
  onChange: (value: DualLocationValue) => void;
}

export function DualLocationInput({ question, value, onChange }: DualLocationInputProps) {
  const current: DualLocationValue = value || { states: [], countries: [], noPreference: false };
  const [stateSearch, setStateSearch] = useState('');
  const [countrySearch, setCountrySearch] = useState('');
  const allCountries = useCountries();

  // Countries list excluding India (handled by state selector)
  const countriesExcludingIndia = useMemo(
    () => allCountries.filter((c) => c.value !== 'india'),
    [allCountries]
  );

  const filteredStates = useMemo(
    () => stateSearch
      ? INDIAN_STATES.filter((s) => s.label.toLowerCase().includes(stateSearch.toLowerCase()))
      : INDIAN_STATES,
    [stateSearch]
  );

  const filteredCountries = useMemo(
    () => countrySearch
      ? countriesExcludingIndia.filter((c) => c.label.toLowerCase().includes(countrySearch.toLowerCase()))
      : countriesExcludingIndia,
    [countrySearch, countriesExcludingIndia]
  );

  function toggleNoPreference() {
    if (current.noPreference) {
      onChange({ states: [], countries: [], noPreference: false });
    } else {
      onChange({ states: [], countries: [], noPreference: true });
      setStateSearch('');
      setCountrySearch('');
    }
  }

  function toggleState(stateValue: string) {
    const next = current.states.includes(stateValue)
      ? current.states.filter((v) => v !== stateValue)
      : [...current.states, stateValue];
    onChange({ ...current, states: next, noPreference: false });
  }

  function toggleCountry(countryValue: string) {
    const next = current.countries.includes(countryValue)
      ? current.countries.filter((v) => v !== countryValue)
      : [...current.countries, countryValue];
    onChange({ ...current, countries: next, noPreference: false });
  }

  return (
    <fieldset>
      <legend className="sr-only">{question.text}</legend>

      {/* No Location Preference toggle */}
      <button
        type="button"
        onClick={toggleNoPreference}
        aria-pressed={current.noPreference}
        data-selected={current.noPreference}
        className="form-chip w-full mb-4 justify-center"
      >
        No location preference
      </button>

      {/* Selected tags — always visible */}
      {!current.noPreference && (current.states.length > 0 || current.countries.length > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {current.states.map((sv) => {
            const label = INDIAN_STATES.find((s) => s.value === sv)?.label || sv;
            return (
              <SelectedPill key={`s-${sv}`} label={label} onRemove={() => toggleState(sv)} />
            );
          })}
          {current.countries.map((cv) => {
            const label = allCountries.find((c) => c.value === cv)?.label || cv;
            return (
              <SelectedPill key={`c-${cv}`} label={label} onRemove={() => toggleCountry(cv)} />
            );
          })}
        </div>
      )}

      {!current.noPreference && (
        <div className="space-y-6">
          {/* Indian States section */}
          <LocationSection
            title="Indian States"
            searchValue={stateSearch}
            onSearchChange={setStateSearch}
            searchPlaceholder="Search states..."
            options={filteredStates}
            selected={current.states}
            onToggle={toggleState}
            allCount={INDIAN_STATES.length}
          />

          {/* Countries section */}
          <LocationSection
            title="Countries (outside India)"
            searchValue={countrySearch}
            onSearchChange={setCountrySearch}
            searchPlaceholder="Search countries..."
            options={filteredCountries}
            selected={current.countries}
            onToggle={toggleCountry}
            allCount={countriesExcludingIndia.length}
          />
        </div>
      )}

      {/* Summary */}
      <p className="form-caption mt-4">
        {current.noPreference
          ? 'Open to any location'
          : current.states.length + current.countries.length === 0
            ? 'No locations selected yet'
            : `${current.states.length + current.countries.length} location${current.states.length + current.countries.length === 1 ? '' : 's'} selected`}
      </p>
    </fieldset>
  );
}

function SelectedPill({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-lg border border-[color:var(--color-samvaya-red)]/30 bg-[color:var(--color-samvaya-red)]/5 px-3 py-1.5 text-[14px] text-[color:var(--color-form-text-primary)]">
      {label}
      <button
        type="button"
        onClick={onRemove}
        className="ml-0.5 inline-flex h-4 w-4 items-center justify-center text-[color:var(--color-samvaya-red)] hover:opacity-70"
        aria-label={`Remove ${label}`}
      >
        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </span>
  );
}

interface LocationSectionProps {
  title: string;
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  options: { value: string; label: string }[];
  selected: string[];
  onToggle: (value: string) => void;
  allCount: number;
}

function LocationSection({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder,
  options,
  selected,
  onToggle,
  allCount,
}: LocationSectionProps) {
  const [isExpanded, setIsExpanded] = useState(selected.length > 0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-between rounded-xl border border-[color:var(--color-form-border)] bg-[color:var(--color-form-surface-muted)] px-4 py-3.5 text-left transition-colors hover:border-[color:var(--color-form-border-strong)]"
      >
        <span className="form-label">{title}</span>
        <div className="flex items-center gap-3">
          {selected.length > 0 && (
            <span className="rounded-full bg-[color:var(--color-samvaya-red)]/10 px-2 py-0.5 text-[12px] font-medium text-[color:var(--color-samvaya-red)]">
              {selected.length}
            </span>
          )}
          <svg
            className={`h-4 w-4 text-[color:var(--color-form-text-tertiary)] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 px-1">
          {/* Search filter */}
          {allCount > 10 && (
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="form-input mb-3"
            />
          )}

          {/* Options list */}
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  data-selected={isSelected}
                  className="form-chip w-full justify-start"
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(option.value)}
                    className="h-4 w-4 rounded border-[color:var(--color-form-border-strong)] text-[color:var(--color-samvaya-red)] focus:ring-[color:var(--color-samvaya-red)]"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
            {options.length === 0 && (
              <p className="form-caption py-2 text-center">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
