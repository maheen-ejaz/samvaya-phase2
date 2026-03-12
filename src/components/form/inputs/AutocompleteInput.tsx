'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import type { QuestionConfig } from '@/lib/form/types';
import { useForm } from '@/components/form/FormProvider';
import { getCitiesForState } from '@/lib/data/indian-cities';
import { COUNTRIES } from '@/lib/data/countries';

interface AutocompleteInputProps {
  question: QuestionConfig;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

/**
 * Text input with autocomplete suggestions.
 * Supports indian_cities (filtered by state answer) and countries.
 * Always allows freeform text — suggestions are optional.
 */
export function AutocompleteInput({ question, value, onChange, disabled }: AutocompleteInputProps) {
  const { state } = useForm();
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Resolve the suggestions list based on autocompleteSource
  const suggestions = useSuggestions(question.autocompleteSource, state.answers, question.id);

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
        type="text"
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
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base text-gray-900 placeholder-gray-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20 disabled:bg-gray-100 disabled:text-gray-500"
      />
      {showDropdown && (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.map((suggestion, idx) => (
            <li
              key={suggestion}
              onMouseDown={(e) => {
                e.preventDefault();
                selectSuggestion(suggestion);
              }}
              onMouseEnter={() => setHighlightedIndex(idx)}
              className={`cursor-pointer px-4 py-2.5 text-base ${
                idx === highlightedIndex
                  ? 'bg-rose-50 text-rose-700'
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
 */
function useSuggestions(
  source: QuestionConfig['autocompleteSource'],
  answers: Record<string, unknown>,
  questionId: string
): string[] {
  if (!source) return [];

  if (source === 'countries') {
    return COUNTRIES.map((c) => c.label);
  }

  if (source === 'indian_cities') {
    // Each city question maps to its corresponding state question
    const stateQuestionMap: Record<string, string> = {
      'Q14': 'Q12',  // birth city → birth state
      'Q23': 'Q22',  // current city → current state
    };
    const stateQuestionId = stateQuestionMap[questionId];
    const stateValue = stateQuestionId ? (answers[stateQuestionId] as string) : '';
    if (!stateValue || stateValue === 'outside_india') return [];
    return getCitiesForState(stateValue);
  }

  return [];
}
