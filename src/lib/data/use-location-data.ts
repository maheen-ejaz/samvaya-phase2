'use client';

import { useState, useEffect } from 'react';
import type { QuestionOption } from '@/lib/form/types';
import {
  loadCountries,
  getCommunitiesForReligion,
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
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on dependency change
      setCities(() => []);
      return;
    }
    getCitiesForStateAsync(stateValue).then(setCities);
  }, [stateValue]);

  return cities;
}

export function useCommunities(religion?: string): string[] {
  const [communities, setCommunities] = useState<string[]>([]);

  useEffect(() => {
    if (!religion) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on dependency change
      setCommunities(() => []);
      return;
    }
    getCommunitiesForReligion(religion).then(setCommunities);
  }, [religion]);

  return communities;
}

export function useCitiesForCountry(countryValue: string | undefined): string[] {
  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    if (!countryValue) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- reset on dependency change
      setCities(() => []);
      return;
    }
    getCitiesForCountryAsync(countryValue).then(setCities);
  }, [countryValue]);

  return cities;
}
