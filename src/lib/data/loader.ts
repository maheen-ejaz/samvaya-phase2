import type { QuestionOption } from '@/lib/form/types';

/**
 * Lazy-loading data fetchers with in-memory cache.
 * JSON files are served from /public/data/ and cached after first fetch.
 */

let countriesCache: QuestionOption[] | null = null;
let indianCitiesCache: Record<string, string[]> | null = null;
let internationalCitiesCache: Record<string, string[]> | null = null;
let communitiesCache: string[] | null = null;

export async function loadCountries(): Promise<QuestionOption[]> {
  if (!countriesCache) {
    const res = await fetch('/data/countries.json');
    countriesCache = await res.json();
  }
  return countriesCache!;
}

export async function loadIndianCities(): Promise<Record<string, string[]>> {
  if (!indianCitiesCache) {
    const res = await fetch('/data/indian-cities.json');
    indianCitiesCache = await res.json();
  }
  return indianCitiesCache!;
}

export async function loadInternationalCities(): Promise<Record<string, string[]>> {
  if (!internationalCitiesCache) {
    const res = await fetch('/data/international-cities.json');
    internationalCitiesCache = await res.json();
  }
  return internationalCitiesCache!;
}

export async function loadCommunities(): Promise<string[]> {
  if (!communitiesCache) {
    const res = await fetch('/data/communities.json');
    communitiesCache = await res.json();
  }
  return communitiesCache!;
}

export async function getCitiesForStateAsync(stateValue: string): Promise<string[]> {
  const cities = await loadIndianCities();
  return cities[stateValue] ?? [];
}

export async function getCitiesForCountryAsync(countryValue: string): Promise<string[]> {
  const cities = await loadInternationalCities();
  return cities[countryValue] ?? [];
}
