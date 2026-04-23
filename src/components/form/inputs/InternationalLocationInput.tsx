'use client';

import { useState, useRef, useEffect, useLayoutEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useCountries, useCitiesForCountry } from '@/lib/data/use-location-data';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DropdownPortal } from './DropdownPortal';
import { cn } from '@/lib/utils';
import { XIcon, ChevronDownIcon } from 'lucide-react';

export interface InternationalLocationValue {
  country: string;
  city: string;
}

interface InternationalLocationInputProps {
  question: QuestionConfig;
  value: InternationalLocationValue | string | null;
  onChange: (value: InternationalLocationValue) => void;
}

export function InternationalLocationInput({ question, value, onChange }: InternationalLocationInputProps) {
  function parseCurrent(): InternationalLocationValue {
    if (!value) return { country: '', city: '' };
    if (typeof value === 'object' && 'country' in value) return value;
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

  const baseId = question.id;
  const countryId = `${baseId}-country`;
  const cityId = `${baseId}-city`;

  const handleCountryChange = (countryValue: string) => {
    onChange({ ...current, country: countryValue });
  };

  const handleCityChange = (city: string) => {
    onChange({ ...current, city });
  };

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor={countryId} className="mb-1.5 block text-sm font-medium">Country</Label>
        <CountryCombobox
          id={countryId}
          value={current.country}
          onChange={handleCountryChange}
          placeholder="Type to search countries..."
        />
      </div>
      <div>
        <Label htmlFor={cityId} className="mb-1.5 block text-sm font-medium">City</Label>
        <CityAutocomplete
          id={cityId}
          countryValue={current.country}
          value={current.city}
          onChange={handleCityChange}
          placeholder={question.placeholder || 'Type your city name'}
        />
      </div>
    </div>
  );
}

function CountryCombobox({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
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

  useLayoutEffect(() => {
    if (!isOpen) {
      setInputValue(selectedOption?.label || '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedOption?.label, isOpen]);

  const query = inputValue.toLowerCase().trim();
  const filtered = useMemo(() => {
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
        <Input
          ref={inputRef}
          id={id}
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
          className={cn(
            'h-11 rounded-xl border-input bg-transparent pr-10 pl-4 text-[15px]',
            'focus-visible:ring-primary/30',
          )}
        />
        {value ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-sm p-0.5 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Clear selection"
          >
            <XIcon className="size-4" />
          </button>
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <ChevronDownIcon className="size-4" />
          </span>
        )}
      </div>
      <DropdownPortal anchorRef={inputRef} isOpen={showDropdown}>
        <ul className="max-h-60 overflow-auto rounded-xl border border-border bg-popover shadow-lg ring-1 ring-foreground/5">
          {filtered.map((option, idx) => (
            <li
              key={option.value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option.value, option.label);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={cn(
                'cursor-pointer px-4 py-2.5 text-sm transition-colors',
                idx === highlightedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50',
              )}
            >
              {option.label}
            </li>
          ))}
        </ul>
      </DropdownPortal>
    </div>
  );
}

function CityAutocomplete({
  id,
  countryValue,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
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
      <Input
        ref={inputRef}
        id={id}
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
        className={cn(
          'h-11 rounded-xl border-input bg-transparent px-4 text-[15px]',
          'focus-visible:ring-primary/30',
        )}
      />
      <DropdownPortal anchorRef={inputRef} isOpen={showDropdown}>
        <ul className="max-h-60 overflow-auto rounded-xl border border-border bg-popover shadow-lg ring-1 ring-foreground/5">
          {filtered.map((suggestion, idx) => (
            <li
              key={suggestion}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={cn(
                'cursor-pointer px-4 py-2.5 text-sm transition-colors',
                idx === highlightedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50',
              )}
            >
              {suggestion}
            </li>
          ))}
        </ul>
      </DropdownPortal>
    </div>
  );
}
