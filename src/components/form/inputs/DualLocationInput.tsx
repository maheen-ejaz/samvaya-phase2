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
        className={`mb-4 flex w-full items-center justify-center gap-2 rounded-lg border-2 px-4 py-3 text-base font-medium transition-colors ${
          current.noPreference
            ? 'border-samvaya-red bg-samvaya-red/10 text-gray-900'
            : 'border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
        }`}
      >
        {current.noPreference && (
          <svg className="h-5 w-5 text-samvaya-red" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        )}
        No location preference
      </button>

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
      <p className="mt-4 text-sm text-gray-500">
        {current.noPreference
          ? 'Open to any location'
          : current.states.length + current.countries.length === 0
            ? 'No locations selected yet'
            : `${current.states.length + current.countries.length} location${current.states.length + current.countries.length === 1 ? '' : 's'} selected`}
      </p>
    </fieldset>
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
        className="flex w-full items-center justify-between rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-left transition-colors hover:bg-gray-100"
      >
        <span className="text-base font-medium text-gray-900">{title}</span>
        <div className="flex items-center gap-2">
          {selected.length > 0 && (
            <span className="rounded-full bg-samvaya-red/10 px-2 py-0.5 text-xs font-medium text-samvaya-red">
              {selected.length}
            </span>
          )}
          <svg
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
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
        <div className="mt-2 px-1">
          {/* Search filter */}
          {allCount > 10 && (
            <input
              type="text"
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="mb-2 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-samvaya-red focus:outline-none focus:ring-2 focus:ring-samvaya-red/20"
            />
          )}

          {/* Options list */}
          <div className="max-h-60 space-y-1 overflow-y-auto">
            {options.map((option) => {
              const isSelected = selected.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    isSelected
                      ? 'border-samvaya-red bg-samvaya-red/10 text-gray-900'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggle(option.value)}
                    className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
            {options.length === 0 && (
              <p className="py-2 text-center text-sm text-gray-400">No results found</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
