#!/usr/bin/env node

/**
 * Generate location data JSON files from GeoNames.
 *
 * Downloads:
 *   - countryInfo.txt        → countries.json
 *   - IN.zip (India cities)  → indian-cities.json
 *   - cities15000.zip        → international-cities.json
 *   - admin1CodesASCII.txt   → state/province mapping
 *
 * Output goes to public/data/
 *
 * Usage: node scripts/generate-location-data.mjs
 */

import { createWriteStream, existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { pipeline } from 'stream/promises';
import { createUnzip } from 'zlib';
import { createInterface } from 'readline';
import { Readable } from 'stream';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT_DIR = join(ROOT, 'public', 'data');
const CACHE_DIR = join(__dirname, '.cache');

// Ensure output dirs exist
mkdirSync(OUT_DIR, { recursive: true });
mkdirSync(CACHE_DIR, { recursive: true });

// ─── GeoNames admin1 code → our snake_case state values ───
// Mapping from GeoNames admin1CodesASCII.txt (IN.xx → state name)
const INDIA_ADMIN1_MAP = {
  '01': 'andaman_nicobar',
  '02': 'andhra_pradesh',
  '03': 'assam',
  '05': 'chandigarh',
  '07': 'delhi',
  '09': 'gujarat',
  '10': 'haryana',
  '11': 'himachal_pradesh',
  '12': 'jammu_kashmir',
  '13': 'kerala',
  '14': 'lakshadweep',
  '16': 'maharashtra',
  '17': 'manipur',
  '18': 'meghalaya',
  '19': 'karnataka',
  '20': 'nagaland',
  '21': 'odisha',
  '22': 'puducherry',
  '23': 'punjab',
  '24': 'rajasthan',
  '25': 'tamil_nadu',
  '26': 'tripura',
  '28': 'west_bengal',
  '29': 'sikkim',
  '30': 'arunachal_pradesh',
  '31': 'mizoram',
  '33': 'goa',
  '34': 'bihar',
  '35': 'madhya_pradesh',
  '36': 'uttar_pradesh',
  '37': 'chhattisgarh',
  '38': 'jharkhand',
  '39': 'uttarakhand',
  '40': 'telangana',
  '41': 'ladakh',
  '52': 'dadra_nagar_haveli',
};

// ─── Helpers ───

async function downloadFile(url, destPath) {
  if (existsSync(destPath)) {
    console.log(`  [cached] ${destPath}`);
    return;
  }
  console.log(`  Downloading ${url} ...`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const fileStream = createWriteStream(destPath);
  await pipeline(Readable.fromWeb(res.body), fileStream);
  console.log(`  Saved to ${destPath}`);
}

async function unzipFile(zipPath, entryName) {
  // Use the built-in unzip command (available on macOS and Linux)
  const { execSync } = await import('child_process');
  const outDir = join(CACHE_DIR, 'unzipped');
  mkdirSync(outDir, { recursive: true });
  execSync(`unzip -o "${zipPath}" "${entryName}" -d "${outDir}"`, { stdio: 'pipe' });
  return join(outDir, entryName);
}

function toSnakeCase(str) {
  return str
    .replace(/&/g, 'and')
    .replace(/['']/g, '')
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .trim()
    .replace(/\s+/g, '_')
    .toLowerCase();
}

function parseTSV(content) {
  return content
    .split('\n')
    .filter(line => line && !line.startsWith('#'))
    .map(line => line.split('\t'));
}

// ─── 1. Countries ───

async function generateCountries() {
  console.log('\n=== Generating countries.json ===');
  const url = 'https://download.geonames.org/export/dump/countryInfo.txt';
  const cachePath = join(CACHE_DIR, 'countryInfo.txt');
  await downloadFile(url, cachePath);

  const content = readFileSync(cachePath, 'utf-8');
  const rows = parseTSV(content);

  // GeoNames countryInfo columns:
  // 0: ISO alpha-2, 1: ISO3, 2: ISO-Numeric, 3: fips, 4: Country name,
  // 5: Capital, 6: Area, 7: Population, 8: Continent, ...

  const countries = [];
  const seenCodes = new Set();

  for (const cols of rows) {
    if (cols.length < 5) continue;
    const code = cols[0].trim();
    const name = cols[4].trim();
    const population = parseInt(cols[7], 10) || 0;

    if (!code || code.length !== 2 || seenCodes.has(code)) continue;
    seenCodes.add(code);

    // Skip very small territories (population < 1000) unless they're commonly known
    const keepSmall = ['MC', 'VA', 'SM', 'LI', 'AD', 'MT', 'IS', 'LU', 'BN', 'MV', 'BH'].includes(code);
    if (population < 1000 && !keepSmall) continue;

    // Map common name overrides
    const nameOverrides = {
      'US': 'United States',
      'GB': 'United Kingdom',
      'RU': 'Russia',
      'KR': 'South Korea',
      'KP': 'North Korea',
      'AE': 'United Arab Emirates',
      'CZ': 'Czech Republic',
      'BA': 'Bosnia & Herzegovina',
      'TT': 'Trinidad & Tobago',
      'CD': 'Democratic Republic of the Congo',
      'CG': 'Republic of the Congo',
      'CI': "Ivory Coast",
      'TW': 'Taiwan',
      'PS': 'Palestine',
      'VA': 'Vatican City',
      'BN': 'Brunei',
      'LA': 'Laos',
      'MM': 'Myanmar',
      'SY': 'Syria',
      'TZ': 'Tanzania',
      'VN': 'Vietnam',
      'IR': 'Iran',
      'BO': 'Bolivia',
      'VE': 'Venezuela',
      'MK': 'North Macedonia',
    };

    const label = nameOverrides[code] || name;
    const value = toSnakeCase(label);

    // Preserve existing value conventions from the codebase
    const valueOverrides = {
      'AE': 'uae',
      'BA': 'bosnia_herzegovina',
      'TT': 'trinidad_tobago',
    };

    countries.push({
      value: valueOverrides[code] || value,
      label,
      code,
    });
  }

  // Sort: India first, then alphabetical by label
  countries.sort((a, b) => {
    if (a.code === 'IN') return -1;
    if (b.code === 'IN') return 1;
    return a.label.localeCompare(b.label);
  });

  // Add "Other" at the end
  countries.push({ value: 'other', label: 'Other', code: '' });

  const outPath = join(OUT_DIR, 'countries.json');
  writeFileSync(outPath, JSON.stringify(countries, null, 2));
  console.log(`  Written ${countries.length} countries to ${outPath}`);
  return countries;
}

// ─── 2. Indian Cities ───

async function generateIndianCities() {
  console.log('\n=== Generating indian-cities.json ===');
  const url = 'https://download.geonames.org/export/dump/IN.zip';
  const cachePath = join(CACHE_DIR, 'IN.zip');
  await downloadFile(url, cachePath);

  const txtPath = await unzipFile(cachePath, 'IN.txt');
  const content = readFileSync(txtPath, 'utf-8');
  const rows = parseTSV(content);

  // GeoNames columns:
  // 0: geonameid, 1: name, 2: asciiname, 3: alternatenames,
  // 4: latitude, 5: longitude, 6: feature class, 7: feature code,
  // 8: country code, 9: cc2, 10: admin1 code, 11: admin2 code,
  // 12: admin3, 13: admin4, 14: population, ...

  const cityMap = {};
  const cityDedup = {}; // state -> Set of lowercase city names

  for (const cols of rows) {
    if (cols.length < 15) continue;

    const name = cols[1].trim();
    const featureClass = cols[6].trim();
    const featureCode = cols[7].trim();
    const admin1 = cols[10].trim();
    const population = parseInt(cols[14], 10) || 0;

    // Only include populated places (P class) with population >= 500
    if (featureClass !== 'P') continue;
    if (population < 500) continue;

    const stateKey = INDIA_ADMIN1_MAP[admin1];
    if (!stateKey) continue;

    if (!cityMap[stateKey]) {
      cityMap[stateKey] = [];
      cityDedup[stateKey] = new Set();
    }

    const nameLower = name.toLowerCase();
    if (cityDedup[stateKey].has(nameLower)) continue;
    cityDedup[stateKey].add(nameLower);

    cityMap[stateKey].push({ name, population });
  }

  // Sort cities within each state: by population desc (most relevant first for autocomplete)
  const result = {};
  const allStates = Object.keys(INDIA_ADMIN1_MAP)
    .map(k => INDIA_ADMIN1_MAP[k])
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  let totalCities = 0;

  for (const state of allStates.sort()) {
    const cities = cityMap[state] || [];
    // Sort alphabetically for consistent autocomplete experience
    cities.sort((a, b) => a.name.localeCompare(b.name));
    result[state] = cities.map(c => c.name);
    totalCities += cities.length;
  }

  const outPath = join(OUT_DIR, 'indian-cities.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`  Written ${totalCities} cities across ${Object.keys(result).length} states to ${outPath}`);
}

// ─── 3. International Cities ───

async function generateInternationalCities(countriesList) {
  console.log('\n=== Generating international-cities.json ===');
  const url = 'https://download.geonames.org/export/dump/cities15000.zip';
  const cachePath = join(CACHE_DIR, 'cities15000.zip');
  await downloadFile(url, cachePath);

  const txtPath = await unzipFile(cachePath, 'cities15000.txt');
  const content = readFileSync(txtPath, 'utf-8');
  const rows = parseTSV(content);

  // Build country code → value map from our countries list
  const codeToValue = {};
  for (const c of countriesList) {
    if (c.code) codeToValue[c.code] = c.value;
  }

  const cityMap = {};
  const cityDedup = {};

  for (const cols of rows) {
    if (cols.length < 15) continue;

    const name = cols[1].trim();
    const countryCode = cols[8].trim();
    const population = parseInt(cols[14], 10) || 0;

    // Skip India (handled separately) and very small cities
    if (countryCode === 'IN') continue;
    if (population < 100000) continue;

    const countryValue = codeToValue[countryCode];
    if (!countryValue) continue;

    if (!cityMap[countryValue]) {
      cityMap[countryValue] = [];
      cityDedup[countryValue] = new Set();
    }

    const nameLower = name.toLowerCase();
    if (cityDedup[countryValue].has(nameLower)) continue;
    cityDedup[countryValue].add(nameLower);

    cityMap[countryValue].push({ name, population });
  }

  // Sort cities alphabetically within each country
  const result = {};
  let totalCities = 0;

  for (const country of Object.keys(cityMap).sort()) {
    const cities = cityMap[country];
    cities.sort((a, b) => a.name.localeCompare(b.name));
    result[country] = cities.map(c => c.name);
    totalCities += cities.length;
  }

  const outPath = join(OUT_DIR, 'international-cities.json');
  writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log(`  Written ${totalCities} cities across ${Object.keys(result).length} countries to ${outPath}`);
}

// ─── Main ───

async function main() {
  console.log('Generating location data from GeoNames...');
  console.log(`Output directory: ${OUT_DIR}`);

  const countries = await generateCountries();
  await generateIndianCities();
  await generateInternationalCities(countries);

  console.log('\n✓ All location data generated successfully!');
  console.log(`  Files in ${OUT_DIR}:`);
  console.log('  - countries.json');
  console.log('  - indian-cities.json');
  console.log('  - international-cities.json');
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
