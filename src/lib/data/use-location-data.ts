'use client';

import { useState, useEffect } from 'react';
import type { QuestionOption } from '@/lib/form/types';
import {
  loadCountries,
  loadCommunities,
  getCitiesForStateAsync,
  getCitiesForCountryAsync,
} from './loader';

export function useCountries(): QuestionOption[] {
  const [countries, setCountries] = useState<QuestionOption[]>([]);

  useEffect(() => {
    loadCountries().then(setCountries);
  }, []);

  return countries;
}

export function useCitiesForState(stateValue: string | undefined): string[] {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (!stateValue || stateValue === 'outside_india') {
      setCities([]);
      return;
    }
    getCitiesForStateAsync(stateValue).then(setCities);
  }, [stateValue]);

  return cities;
}

export function useCommunities(): string[] {
  const [communities, setCommunities] = useState<string[]>([]);

  useEffect(() => {
    loadCommunities().then(setCommunities);
  }, []);

  return communities;
}

export function useCitiesForCountry(countryValue: string | undefined): string[] {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (!countryValue) {
      setCities([]);
      return;
    }
    getCitiesForCountryAsync(countryValue).then(setCities);
  }, [countryValue]);

  return cities;
}
