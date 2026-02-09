/**
 * Country slug utilities for URL-based country filtering.
 * Maps between Polish country keys, translated names, and URL slugs per language.
 * Also normalizes inconsistent mentionedCountries from the API.
 */

import { createSlug } from './slug';
import type { Language } from '../stores/languageStore';
import { getCategoryFromSlug, getCategorySlug } from './categorySlug';

/** URL segment for country filter per language */
export const COUNTRY_SEGMENT: Record<Language, string> = { pl: 'kraj', en: 'country', de: 'land' };

/** All country segments for route matching */
export const ALL_COUNTRY_SEGMENTS = Object.values(COUNTRY_SEGMENT);

/** Canonical list of 15 supported countries (key = Polish name) */
export const COUNTRIES: Record<string, Record<Language, string>> = {
  'Polska':          { pl: 'Polska',          en: 'Poland',         de: 'Polen' },
  'Niemcy':          { pl: 'Niemcy',          en: 'Germany',        de: 'Deutschland' },
  'Włochy':          { pl: 'Włochy',          en: 'Italy',          de: 'Italien' },
  'USA':             { pl: 'USA',             en: 'USA',            de: 'USA' },
  'Hiszpania':       { pl: 'Hiszpania',       en: 'Spain',          de: 'Spanien' },
  'Francja':         { pl: 'Francja',         en: 'France',         de: 'Frankreich' },
  'Rosja':           { pl: 'Rosja',           en: 'Russia',         de: 'Russland' },
  'Ukraina':         { pl: 'Ukraina',         en: 'Ukraine',        de: 'Ukraine' },
  'Austria':         { pl: 'Austria',         en: 'Austria',        de: 'Österreich' },
  'Wielka Brytania': { pl: 'Wielka Brytania', en: 'United Kingdom', de: 'Großbritannien' },
  'Chiny':           { pl: 'Chiny',           en: 'China',          de: 'China' },
  'Czechy':          { pl: 'Czechy',          en: 'Czech Republic', de: 'Tschechien' },
  'Szwajcaria':      { pl: 'Szwajcaria',      en: 'Switzerland',    de: 'Schweiz' },
  'Izrael':          { pl: 'Izrael',          en: 'Israel',         de: 'Israel' },
  'Holandia':        { pl: 'Holandia',        en: 'Netherlands',    de: 'Niederlande' },
};

/** Polish key list for iteration */
export const COUNTRY_KEYS = Object.keys(COUNTRIES);

/** ISO 3166-1 alpha-2 codes for flag-icons CSS library */
export const COUNTRY_FLAG_CODES: Record<string, string> = {
  'Polska': 'pl',
  'Niemcy': 'de',
  'Włochy': 'it',
  'USA': 'us',
  'Hiszpania': 'es',
  'Francja': 'fr',
  'Rosja': 'ru',
  'Ukraina': 'ua',
  'Austria': 'at',
  'Wielka Brytania': 'gb',
  'Chiny': 'cn',
  'Czechy': 'cz',
  'Szwajcaria': 'ch',
  'Izrael': 'il',
  'Holandia': 'nl',
};

/**
 * Aliases map: maps inconsistent API names to canonical Polish keys.
 * Covers all 3 languages + known duplicates.
 */
const COUNTRY_ALIASES: Record<string, string> = {
  // PL duplicates
  'Stany Zjednoczone': 'USA',
  // EN names
  'United States': 'USA',
  'Great Britain': 'Wielka Brytania',
  'United Kingdom': 'Wielka Brytania',
  'Italy': 'Włochy',
  'Germany': 'Niemcy',
  'France': 'Francja',
  'Spain': 'Hiszpania',
  'Poland': 'Polska',
  'Russia': 'Rosja',
  'Ukraine': 'Ukraina',
  'China': 'Chiny',
  'Czech Republic': 'Czechy',
  'Switzerland': 'Szwajcaria',
  'Israel': 'Izrael',
  'Netherlands': 'Holandia',
  // DE names
  'Vereinigte Staaten': 'USA',
  'Vereinigtes Königreich': 'Wielka Brytania',
  'Großbritannien': 'Wielka Brytania',
  'Italien': 'Włochy',
  'Deutschland': 'Niemcy',
  'Frankreich': 'Francja',
  'Spanien': 'Hiszpania',
  'Polen': 'Polska',
  'Russland': 'Rosja',
  'Österreich': 'Austria',
  'Tschechien': 'Czechy',
  'Schweiz': 'Szwajcaria',
  'Niederlande': 'Holandia',
};

/**
 * Normalize any country name (from any language) to the canonical Polish key.
 * Returns null if the country is not in our supported list.
 */
export function normalizeCountry(name: string): string | null {
  if (COUNTRIES[name]) return name;
  return COUNTRY_ALIASES[name] ?? null;
}

// Build reverse lookup: { lang: { slug: polishKey } }
function buildSlugToCountry(): Record<Language, Record<string, string>> {
  const result: Record<Language, Record<string, string>> = { pl: {}, en: {}, de: {} };
  for (const [polishKey, translations] of Object.entries(COUNTRIES)) {
    for (const lang of ['pl', 'en', 'de'] as Language[]) {
      const slug = createSlug(translations[lang]);
      result[lang][slug] = polishKey;
    }
  }
  return result;
}

const SLUG_TO_COUNTRY = buildSlugToCountry();

/** Get URL slug for a Polish country key in the given language */
export function getCountrySlug(polishCountry: string, language: Language): string {
  const translated = COUNTRIES[polishCountry]?.[language] || polishCountry;
  return createSlug(translated);
}

/** Resolve a URL slug back to the Polish country key, or null if invalid */
export function getCountryFromSlug(slug: string, language: Language): string | null {
  return SLUG_TO_COUNTRY[language]?.[slug] ?? null;
}

/** Get translated display name for a Polish country key */
export function getCountryDisplay(polishCountry: string, language: Language): string {
  return COUNTRIES[polishCountry]?.[language] || polishCountry;
}

/** Build URL segment for multiple selected countries */
export function buildCountrySlugsParam(countries: string[], language: Language): string {
  return countries.map(c => getCountrySlug(c, language)).join('+');
}

/** Parse URL segment back to Polish country keys */
export function parseCountrySlugsParam(param: string, language: Language): string[] {
  return param
    .split('+')
    .map(slug => getCountryFromSlug(slug, language))
    .filter((c): c is string => c !== null);
}

/**
 * Translate a path (without language prefix) from one language to another.
 * Handles category, country, and category+country routes; returns path as-is for other pages.
 */
export function translatePath(path: string, fromLang: Language, toLang: Language): string {
  // Category + Country: /:catSlug/(kraj|country|land)/:countrySlugs
  const catCountryMatch = path.match(/^\/([^/]+)\/(kraj|country|land)\/(.+)$/);
  if (catCountryMatch) {
    const polishCat = getCategoryFromSlug(catCountryMatch[1], fromLang);
    const countries = parseCountrySlugsParam(catCountryMatch[3], fromLang);
    if (polishCat && countries.length > 0) {
      return `/${getCategorySlug(polishCat, toLang)}/${COUNTRY_SEGMENT[toLang]}/${buildCountrySlugsParam(countries, toLang)}`;
    }
  }

  // Country only: /(kraj|country|land)/:countrySlugs
  const countryMatch = path.match(/^\/(kraj|country|land)\/(.+)$/);
  if (countryMatch) {
    const countries = parseCountrySlugsParam(countryMatch[2], fromLang);
    if (countries.length > 0) {
      return `/${COUNTRY_SEGMENT[toLang]}/${buildCountrySlugsParam(countries, toLang)}`;
    }
  }

  // Category only: /:catSlug (single segment, no slashes)
  const catSlug = path.replace(/^\//, '');
  if (catSlug && !catSlug.includes('/')) {
    const polishCat = getCategoryFromSlug(catSlug, fromLang);
    if (polishCat) {
      return `/${getCategorySlug(polishCat, toLang)}`;
    }
  }

  // Other pages — return unchanged
  return path;
}
