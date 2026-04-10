'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useCountries, useCitiesForCountry } from '@/lib/data/use-location-data';

export interface InternationalLocationValue {
  country: string;
  city: string;
}

interface InternationalLocationInputProps {
  question: QuestionConfig;
  value: InternationalLocationValue | string | null;
  onChange: (value: InternationalLocationValue) => void;
}

/**
 * Compound input for international locations: country combobox + city autocomplete.
 * Used for Q13 (city and country of birth when born outside India).
 */
export function InternationalLocationInput({ question, value, onChange }: InternationalLocationInputProps) {
  // Parse legacy string values (e.g. "Dubai, UAE") into structured format
  function parseCurrent(): InternationalLocationValue {
    if (!value) return { country: '', city: '' };
    if (typeof value === 'object' && 'country' in value) return value;
    // Legacy string format: "City, Country" — parse best-effort
    if (typeof value === 'string') {
      const lastComma = value.lastIndexOf(',');
      if (lastComma > 0) {
        return { city: value.slice(0, lastComma).trim(), country: '' };
      }
      return { city: value, country: '' };
    }
    return { country: '', city: '' };
  }
  const current = parseCurrent();

  const handleCountryChange = (countryValue: string) => {
    onChange({ ...current, country: countryValue });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...current, city });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Country</label>
        <CountryCombobox
          value={current.country}
          onChange={handleCountryChange}
          placeholder="Type to search countries..."
        />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">City</label>
        <CityAutocomplete
          countryValue={current.country}
          value={current.city}
          onChange={handleCityChange}
          placeholder={question.placeholder || 'Type your city name'}
        />
      </div>
    </div>
  );
}

// ─── Country Combobox ───

function CountryCombobox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const countries = useCountries();
  const selectedOption = useMemo(
    () => countries.find((c) => c.value === value),
    [countries, value],
  );

  const [inputValue, setInputValue] = useState(selectedOption?.label || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input display when value changes externally (e.g. form reset or save-and-resume).
  // useLayoutEffect avoids the cascading-render lint rule because it runs synchronously
  // before paint — appropriate here since we're syncing a controlled display value.
  useLayoutEffect(() => {
    if (!isOpen) {
      setInputValue(selectedOption?.label || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption?.label, isOpen]);

  const query = inputValue.toLowerCase().trim();
  const filtered = useMemo(() => {
    // Exclude "India" and "Other" from the list (user already indicated outside India)
    const base = countries.filter((c) => c.value !== 'india' && c.value !== 'other');
    if (!query) return base.slice(0, 10);
    return base.filter((c) => c.label.toLowerCase().includes(query)).slice(0, 10);
  }, [query, countries]);

  const showDropdown = isOpen && filtered.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInputValue(selectedOption?.label || '');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [selectedOption]);

  const selectOption = useCallback((optionValue: string, optionLabel: string) => {
    onChange(optionValue);
    setInputValue(optionLabel);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onChange]);

  const clearSelection = useCallback(() => {
    onChange('');
    setInputValue('');
    setHighlightedIndex(-1);
    inputRef.current?.focus();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) setIsOpen(true);
      else setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0 && showDropdown) {
      e.preventDefault();
      const opt = filtered[highlightedIndex];
      selectOption(opt.value, opt.label);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue(selectedOption?.label || '');
      inputRef.current?.blur();
    }
  }, [isOpen, highlightedIndex, filtered, showDropdown, selectOption, selectedOption]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            setIsOpen(true);
            if (inputValue) inputRef.current?.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="form-input pr-10"
        />
        {value ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            aria-label="Clear selection"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        )}
      </div>
      {showDropdown && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[color:var(--color-form-border)] bg-white shadow-lg">
          {filtered.map((option, idx) => (
            <li
              key={option.value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option.value, option.label);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`cursor-pointer px-4 py-3 text-[15px] ${
                idx === highlightedIndex
                  ? 'bg-[color:var(--color-form-surface-muted)] text-[color:var(--color-form-text-primary)]'
                  : 'text-[color:var(--color-form-text-secondary)] hover:bg-[color:var(--color-form-surface-muted)]'
              }`}
            >
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ─── City Autocomplete ───

function CityAutocomplete({
  countryValue,
  value,
  onChange,
  placeholder,
}: {
  countryValue: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const cities = useCitiesForCountry(countryValue);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const query = (value || '').toLowerCase().trim();
  const filtered = useMemo(
    () => query.length > 0
      ? cities.filter((c) => c.toLowerCase().includes(query)).slice(0, 10)
      : [],
    [query, cities],
  );

  const exactMatch = filtered.length === 1 && filtered[0].toLowerCase() === query;
  const showDropdown = isOpen && filtered.length > 0 && !exactMatch;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectSuggestion = useCallback((suggestion: string) => {
    onChange(suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
    inputRef.current?.blur();
  }, [onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!showDropdown) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && highlightedIndex >= 0) {
      e.preventDefault();
      selectSuggestion(filtered[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, [showDropdown, highlightedIndex, filtered, selectSuggestion]);

  return (
    <div ref={containerRef} className="relative">
      <input
        ref={inputRef}
        type="text"
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="off"
        className="form-input"
      />
      {showDropdown && (
        <ul className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[color:var(--color-form-border)] bg-white shadow-lg">
          {filtered.map((suggestion, idx) => (
            <li
              key={suggestion}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`cursor-pointer px-4 py-3 text-[15px] ${
                idx === highlightedIndex
                  ? 'bg-[color:var(--color-form-surface-muted)] text-[color:var(--color-form-text-primary)]'
                  : 'text-[color:var(--color-form-text-secondary)] hover:bg-[color:var(--color-form-surface-muted)]'
              }`}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
