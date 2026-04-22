'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useForm } from '@/components/form/FormProvider';
import { useCitiesForState, useCountries, useCommunities } from '@/lib/data/use-location-data';
import { Input } from '@/components/ui/input';
import { DropdownPortal } from './DropdownPortal';
import { cn } from '@/lib/utils';

interface AutocompleteInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  inputId?: string;
  ariaDescribedBy?: string;
  ariaInvalid?: boolean;
}

/**
 * Text input with autocomplete suggestions.
 * Supports indian_cities (filtered by state answer) and countries.
 * Always allows freeform text — suggestions are optional.
 */
export function AutocompleteInput({ question, value, onChange, disabled, inputId, ariaDescribedBy, ariaInvalid }: AutocompleteInputProps) {
  const { state } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve the suggestions list based on autocompleteSource
  const suggestions = useAutocompleteSuggestions(question.autocompleteSource, state.answers, question.id);

  // Filter suggestions by current input value
  const query = (value || '').toLowerCase().trim();
  const filtered = useMemo(
    () => query.length > 0
      ? suggestions.filter((s) => s.toLowerCase().includes(query)).slice(0, 10)
      : [],
    [query, suggestions],
  );

  // Don't show dropdown if the input exactly matches a suggestion
  const exactMatch = filtered.length === 1 && filtered[0].toLowerCase() === query;
  const showDropdown = isOpen && filtered.length > 0 && !exactMatch;
  const resolvedInputId = inputId || `autocomplete-${question.id}`;
  const listboxId = `listbox-${question.id}`;

  // Close dropdown on outside click
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

  // Keyboard navigation
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
        id={resolvedInputId}
        type="text"
        role="combobox"
        aria-expanded={showDropdown}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={showDropdown && highlightedIndex >= 0 ? `option-${question.id}-${highlightedIndex}` : undefined}
        aria-describedby={ariaDescribedBy}
        aria-invalid={ariaInvalid || undefined}
        value={value || ''}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
          setHighlightedIndex(-1);
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={question.placeholder}
        disabled={disabled}
        autoComplete="off"
        className={cn(
          'h-11 rounded-xl border-input bg-transparent px-4 text-[15px]',
          'focus-visible:ring-primary/30',
        )}
      />
      <DropdownPortal anchorRef={inputRef} isOpen={showDropdown}>
        <ul
          id={listboxId}
          role="listbox"
          className="max-h-60 overflow-auto rounded-xl border border-border bg-popover shadow-lg ring-1 ring-foreground/5"
        >
          {filtered.map((suggestion, idx) => (
            <li
              key={suggestion}
              id={`option-${question.id}-${idx}`}
              role="option"
              aria-selected={idx === highlightedIndex}
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

/**
 * Resolve the full list of suggestions based on the source type and current answers.
 * Uses async hooks that lazy-load data from JSON files.
 */
function useAutocompleteSuggestions(
  source: QuestionConfig['autocompleteSource'],
  answers: Record<string, unknown>,
  questionId: string
): string[] {
  const stateQuestionMap: Record<string, string> = {
    'Q14': 'Q12',
    'Q23': 'Q22',
  };
  const stateQuestionId = stateQuestionMap[questionId];
  const stateValue = stateQuestionId ? (answers[stateQuestionId] as string) : undefined;

  const religionValue = source === 'communities' ? (answers['Q27'] as string | undefined) : undefined;

  const indianCities = useCitiesForState(
    source === 'indian_cities' ? stateValue : undefined
  );
  const countries = useCountries();
  const communities = useCommunities(religionValue);

  if (!source) return [];

  if (source === 'countries') {
    return countries.map((c) => c.label);
  }

  if (source === 'indian_cities') {
    return indianCities;
  }

  if (source === 'communities') {
    return communities;
  }

  return [];
}
