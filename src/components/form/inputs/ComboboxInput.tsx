'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useCountries } from '@/lib/data/use-location-data';
import { Input } from '@/components/ui/input';
import { DropdownPortal } from './DropdownPortal';
import { cn } from '@/lib/utils';
import { XIcon, ChevronDownIcon, CheckIcon } from 'lucide-react';

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
        <Input
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
            if (inputValue) inputRef.current?.select();
          }}
          onKeyDown={handleKeyDown}
          placeholder={question.placeholder || 'Type to search...'}
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
        <ul
          id={listboxId}
          role="listbox"
          className="max-h-60 overflow-auto rounded-xl border border-border bg-popover shadow-lg ring-1 ring-foreground/5"
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
              className={cn(
                'flex cursor-pointer items-center gap-2 px-4 py-2.5 text-sm transition-colors',
                idx === highlightedIndex
                  ? 'bg-accent text-accent-foreground'
                  : 'text-foreground hover:bg-accent/50',
              )}
            >
              <span className="flex-1">{option.label}</span>
              {option.value === value && <CheckIcon className="size-4 text-primary" />}
            </li>
          ))}
          {filtered.length === 0 && (
            <li role="option" aria-disabled="true" className="px-4 py-3 text-sm text-muted-foreground">No matches found</li>
          )}
        </ul>
      </DropdownPortal>
    </div>
  );
}
