'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useCountries } from '@/lib/data/use-location-data';
import { DropdownPortal } from './DropdownPortal';

interface ComboboxInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function ComboboxInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: ComboboxInputProps) {
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- sync display label when closed
      setInputValue(() => selectedOption?.label || '');
    }
  }, [selectedOption, isOpen]);

  const query = inputValue.toLowerCase().trim();

  const filtered = useMemo(() => {
    if (!query) return options.slice(0, 10);
    return options.filter((o) => o.label.toLowerCase().includes(query)).slice(0, 10);
  }, [query, options]);

  const showDropdown = isOpen && filtered.length > 0;
  const resolvedInputId = inputId || `combobox-${question.id}`;
  const listboxId = `listbox-${question.id}`;

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
          id={resolvedInputId}
          type="text"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={showDropdown && highlightedIndex >= 0 ? `option-${question.id}-${highlightedIndex}` : undefined}
          aria-describedby={ariaDescribedBy}
          aria-invalid={ariaInvalid || undefined}
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
          className="form-input pr-10"
        />
        {value ? (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[color:var(--color-form-text-tertiary)] hover:text-[color:var(--color-form-text-primary)]"
            aria-label="Clear selection"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        ) : (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[color:var(--color-form-text-tertiary)]">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </span>
        )}
      </div>
      <DropdownPortal anchorRef={inputRef} isOpen={showDropdown}>
        <ul
          id={listboxId}
          role="listbox"
          className="max-h-60 overflow-auto rounded-xl border border-[color:var(--color-form-border)] bg-white shadow-lg"
        >
          {filtered.map((option, idx) => (
            <li
              key={option.value}
              id={`option-${question.id}-${idx}`}
              role="option"
              aria-selected={option.value === value}
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
          {filtered.length === 0 && (
            <li role="option" aria-disabled="true" className="form-caption px-4 py-3">No matches found</li>
          )}
        </ul>
      </DropdownPortal>
    </div>
  );
}
