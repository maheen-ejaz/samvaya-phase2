'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useCountries } from '@/lib/data/use-location-data';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DropdownPortal } from './DropdownPortal';
import { cn } from '@/lib/utils';
import { XIcon, SearchIcon } from 'lucide-react';

interface TagInputProps {
  question: QuestionConfig;
  value: string[];
  onChange: (value: string[]) => void;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

export function TagInput({ question, value, onChange, inputId, ariaDescribedBy, ariaInvalid }: TagInputProps) {
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
  const resolvedInputId = inputId || `tag-${question.id}`;
  const listboxId = `listbox-${question.id}`;

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
        <div className="mb-3 flex flex-wrap gap-2">
          {selectedLabels.map((item) => (
            <Badge
              key={item.value}
              variant="secondary"
              className="h-auto gap-1.5 rounded-lg px-3 py-1.5 text-sm font-normal"
            >
              {item.label}
              <button
                type="button"
                onClick={() => removeOption(item.value)}
                className="ml-0.5 inline-flex size-4 items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                aria-label={`Remove ${item.label}`}
              >
                <XIcon className="size-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
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
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={atMax ? 'Maximum reached' : (question.placeholder || 'Type to search...')}
          disabled={atMax}
          autoComplete="off"
          className={cn(
            'h-11 rounded-xl border-input bg-transparent pr-10 pl-4 text-[15px]',
            'focus-visible:ring-primary/30',
          )}
        />
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          <SearchIcon className="size-4" />
        </span>
      </div>

      {/* Count indicator */}
      {value.length > 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          {value.length} selected{question.maxSelections ? ` (max ${question.maxSelections})` : ''}
        </p>
      )}

      {/* Dropdown */}
      <DropdownPortal anchorRef={inputRef} isOpen={showDropdown}>
        <ul
          id={listboxId}
          role="listbox"
          aria-multiselectable="true"
          className="max-h-60 overflow-auto rounded-xl border border-border bg-popover shadow-lg ring-1 ring-foreground/5"
        >
          {filtered.map((option, idx) => (
            <li
              key={option.value}
              id={`option-${question.id}-${idx}`}
              role="option"
              aria-selected={idx === highlightedIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                addOption(option.value);
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
