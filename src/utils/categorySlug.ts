/**
 * Category slug utilities for URL-based category routing.
 * Maps between Polish category names, translated names, and URL slugs per language.
 */

import { createSlug } from './slug';
import type { Language } from '../stores/languageStore';

// Category translations (mirrors locales/*/common.json categories)
const CATEGORY_TRANSLATIONS: Record<string, Record<Language, string>> = {
  'Świat':                { pl: 'Świat',                  en: 'World',                    de: 'Welt' },
  'Gospodarka':           { pl: 'Gospodarka',             en: 'Economy',                  de: 'Wirtschaft' },
  'Społeczeństwo':        { pl: 'Społeczeństwo',          en: 'Society',                  de: 'Gesellschaft' },
  'Polityka':             { pl: 'Polityka',               en: 'Politics',                 de: 'Politik' },
  'Sport':                { pl: 'Sport',                  en: 'Sports',                   de: 'Sport' },
  'Kultura':              { pl: 'Kultura',                en: 'Culture',                  de: 'Kultur' },
  'Przestępczość':        { pl: 'Przestępczość',          en: 'Crime',                    de: 'Kriminalität' },
  'Styl Życia':           { pl: 'Styl Życia',             en: 'Lifestyle',                de: 'Lebensstil' },
  'Pogoda i Środowisko':  { pl: 'Pogoda i Środowisko',    en: 'Weather & Environment',    de: 'Wetter & Umwelt' },
  'Nauka i Technologia':  { pl: 'Nauka i Technologia',    en: 'Science & Technology',     de: 'Wissenschaft & Technologie' },
};

// Build reverse lookup: { lang: { slug: polishCategoryName } }
function buildSlugToCategory(): Record<Language, Record<string, string>> {
  const result: Record<Language, Record<string, string>> = { pl: {}, en: {}, de: {} };
  for (const [polishName, translations] of Object.entries(CATEGORY_TRANSLATIONS)) {
    for (const lang of ['pl', 'en', 'de'] as Language[]) {
      const slug = createSlug(translations[lang]);
      result[lang][slug] = polishName;
    }
  }
  return result;
}

const SLUG_TO_CATEGORY = buildSlugToCategory();

/** Get URL slug for a Polish category name in the given language */
export function getCategorySlug(polishCategory: string, language: Language): string {
  const translated = CATEGORY_TRANSLATIONS[polishCategory]?.[language] || polishCategory;
  return createSlug(translated);
}

/** Resolve a URL slug back to the Polish category name, or null if invalid */
export function getCategoryFromSlug(slug: string, language: Language): string | null {
  return SLUG_TO_CATEGORY[language]?.[slug] ?? null;
}

/** Check if a slug is a valid category for the given language */
export function isValidCategorySlug(slug: string, language: Language): boolean {
  return getCategoryFromSlug(slug, language) !== null;
}
