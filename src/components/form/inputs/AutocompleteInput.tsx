'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useForm } from '@/components/form/FormProvider';
import { useCitiesForState, useCountries, useCommunities } from '@/lib/data/use-location-data';

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
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-base text-gray-900 placeholder-gray-400 transition-all duration-200 focus:border-samvaya-red focus:outline-none focus:ring-0 focus:shadow-[0_0_0_3px_rgba(163,23,31,0.25)] disabled:bg-gray-100 disabled:text-gray-400"
      />
      {showDropdown && (
        <ul
          id={listboxId}
          role="listbox"
          className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg"
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
              className={`cursor-pointer px-4 py-2.5 text-base ${
                idx === highlightedIndex
                  ? 'bg-samvaya-red/10 text-gray-900'
                  : 'text-gray-700 hover:bg-gray-50'
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

/**
 * Resolve the full list of suggestions based on the source type and current answers.
 * Uses async hooks that lazy-load data from JSON files.
 */
function useAutocompleteSuggestions(
  source: QuestionConfig['autocompleteSource'],
  answers: Record<string, unknown>,
  questionId: string
): string[] {
  // Determine which state value to use for indian_cities filtering
  const stateQuestionMap: Record<string, string> = {
    'Q14': 'Q12',  // birth city → birth state
    'Q23': 'Q22',  // current city → current state
  };
  const stateQuestionId = stateQuestionMap[questionId];
  const stateValue = stateQuestionId ? (answers[stateQuestionId] as string) : undefined;

  // Resolve religion for community filtering
  const religionValue = source === 'communities' ? (answers['Q27'] as string | undefined) : undefined;

  // Load data via hooks (these are no-ops when source doesn't match)
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
