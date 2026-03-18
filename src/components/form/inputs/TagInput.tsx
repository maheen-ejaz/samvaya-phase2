'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useCountries } from '@/lib/data/use-location-data';

interface TagInputProps {
  question: QuestionConfig;
  value: string[];
  onChange: (value: string[]) => void;
}

export function TagInput({ question, value, onChange }: TagInputProps) {
  const lazyCountries = useCountries();
  const options = question.optionsSource === 'countries' ? lazyCountries : (question.options || []);
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedSet = useMemo(() => new Set(value), [value]);
  const atMax = question.maxSelections ? value.length >= question.maxSelections : false;

  const query = inputValue.toLowerCase().trim();

  const filtered = useMemo(() => {
    const unselected = options.filter((o) => !selectedSet.has(o.value));
    if (!query) return unselected.slice(0, 10);
    return unselected.filter((o) => o.label.toLowerCase().includes(query)).slice(0, 10);
  }, [query, options, selectedSet]);

  const showDropdown = isOpen && filtered.length > 0 && !atMax;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setInputValue('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addOption = useCallback((optionValue: string) => {
    if (atMax) return;
    onChange([...value, optionValue]);
    setInputValue('');
    setHighlightedIndex(-1);
    // Re-assert dropdown open after React re-render and any browser click events
    // that may fire on the now-removed <li>, triggering the outside-click handler.
    requestAnimationFrame(() => {
      setIsOpen(true);
      inputRef.current?.focus();
    });
  }, [value, onChange, atMax]);

  const removeOption = useCallback((optionValue: string) => {
    onChange(value.filter((v) => v !== optionValue));
  }, [value, onChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      // Remove last pill on backspace in empty input
      onChange(value.slice(0, -1));
      return;
    }

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
      addOption(filtered[highlightedIndex].value);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setInputValue('');
    }
  }, [inputValue, value, onChange, isOpen, highlightedIndex, filtered, showDropdown, addOption]);

  // Resolve labels for selected values
  const selectedLabels = useMemo(() => {
    const labelMap = new Map(options.map((o) => [o.value, o.label]));
    return value.map((v) => ({ value: v, label: labelMap.get(v) || v }));
  }, [value, options]);

  return (
    <div ref={containerRef} className="relative">
      {/* Selected pills */}
      {selectedLabels.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedLabels.map((item) => (
            <span
              key={item.value}
              className="inline-flex items-center gap-1 rounded-full border border-samvaya-red/20 bg-samvaya-red/10 px-3 py-1 text-sm text-gray-900"
            >
              {item.label}
              <button
                type="button"
                onClick={() => removeOption(item.value)}
                className="ml-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full text-samvaya-red hover:bg-samvaya-red/20 hover:text-samvaya-red"
                aria-label={`Remove ${item.label}`}
              >
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Search input */}
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
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={atMax ? 'Maximum reached' : (question.placeholder || 'Type to search...')}
          disabled={atMax}
          autoComplete="off"
          className="w-full rounded-lg border border-gray-300 bg-white py-3 pl-4 pr-10 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)] disabled:bg-gray-100 disabled:text-gray-400"
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
      </div>

      {/* Count indicator */}
      {value.length > 0 && (
        <p className="mt-1.5 text-sm text-gray-500">
          {value.length} selected{question.maxSelections ? ` (max ${question.maxSelections})` : ''}
        </p>
      )}

      {/* Dropdown */}
      {showDropdown && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((option, idx) => (
            <li
              key={option.value}
              onMouseDown={(e) => {
                e.preventDefault();
                addOption(option.value);
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
        </ul>
      )}
    </div>
  );
}
