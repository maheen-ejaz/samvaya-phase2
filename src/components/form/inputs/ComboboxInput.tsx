'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useCountries } from '@/lib/data/use-location-data';

interface ComboboxInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
}

export function ComboboxInput({ question, value, onChange }: ComboboxInputProps) {
  const lazyCountries = useCountries();
  const options = question.optionsSource === 'countries' ? lazyCountries : (question.options || []);
  const selectedOption = useMemo(
    () => options.find((o) => o.value === value),
    [options, value],
  );

  const [inputValue, setInputValue] = useState(selectedOption?.label || '');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync input display when value prop changes (e.g. save-and-resume)
  useEffect(() => {
    if (!isOpen) {
      setInputValue(selectedOption?.label || '');
    }
  }, [selectedOption, isOpen]);

  const query = inputValue.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 10);
    return options.filter((o) => o.label.toLowerCase().includes(query)).slice(0, 10);
  }, [query, options]);

  const showDropdown = isOpen && filtered.length > 0;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        // Reset input to selected label if user didn't pick anything
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
      if (!isOpen) {
        setIsOpen(true);
      } else {
        setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
      }
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
            // Select all text on focus so user can type over to search
            if (inputValue) inputRef.current?.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder || 'Type to search...'}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)]"
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
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((option, idx) => (
            <li
              key={option.value}
              onMouseDown={(e) => {
                e.preventDefault();
                selectOption(option.value, option.label);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`cursor-pointer px-4 py-2.5 text-base ${
                idx === highlightedIndex
                  ? 'bg-samvaya-red/10 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {option.label}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="px-4 py-2.5 text-sm text-gray-400">No matches found</li>
          )}
        </ul>
      )}
    </div>
  );
}
