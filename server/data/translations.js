// Category translations for OG images (Polish category name → localized name)
export const CATEGORY_TRANSLATIONS = {
  'Świat':                  { pl: 'Świat',                  en: 'World',                    de: 'Welt' },
  'Gospodarka':             { pl: 'Gospodarka',             en: 'Economy',                  de: 'Wirtschaft' },
  'Polityka':               { pl: 'Polityka',               en: 'Politics',                 de: 'Politik' },
  'Społeczeństwo':          { pl: 'Społeczeństwo',          en: 'Society',                  de: 'Gesellschaft' },
  'Sport':                  { pl: 'Sport',                  en: 'Sports',                   de: 'Sport' },
  'Kultura':                { pl: 'Kultura',                en: 'Culture',                  de: 'Kultur' },
  'Przestępczość':          { pl: 'Przestępczość',          en: 'Crime',                    de: 'Kriminalität' },
  'Styl Życia':             { pl: 'Styl Życia',             en: 'Lifestyle',                de: 'Lebensstil' },
  'Pogoda i Środowisko':    { pl: 'Pogoda i Środowisko',    en: 'Weather & Environment',    de: 'Wetter & Umwelt' },
  'Nauka i Technologia':    { pl: 'Nauka i Technologia',    en: 'Science & Technology',     de: 'Wissenschaft & Technologie' },
  'Inne':                   { pl: 'Inne',                   en: 'Other',                    de: 'Sonstiges' },
};

// Category page descriptions for SEO (Polish category name → localized description)
export const CATEGORY_DESCRIPTIONS = {
  'Świat': {
    pl: 'Najważniejsze wydarzenia ze świata. AI agreguje i podsumowuje wiadomości międzynarodowe z wielu źródeł — bez clickbaitów.',
    en: 'Top world news aggregated from multiple sources. AI organizes and summarizes international events — no clickbait, only verified facts.',
    de: 'Die wichtigsten Weltnachrichten aus mehreren Quellen. KI organisiert und fasst internationale Ereignisse zusammen — ohne Clickbait.',
  },
  'Gospodarka': {
    pl: 'Wiadomości gospodarcze i ekonomiczne. AI agreguje najważniejsze informacje o rynkach, finansach i polityce gospodarczej.',
    en: 'Economic and business news. AI aggregates the most important information about markets, finance and economic policy.',
    de: 'Wirtschafts- und Finanznachrichten. KI aggregiert die wichtigsten Informationen über Märkte, Finanzen und Wirtschaftspolitik.',
  },
  'Społeczeństwo': {
    pl: 'Wiadomości społeczne. AI agreguje najważniejsze informacje o wydarzeniach społecznych, edukacji, zdrowiu i demografii.',
    en: 'Society news. AI aggregates the most important information about social events, education, health and demographics.',
    de: 'Gesellschaftsnachrichten. KI aggregiert die wichtigsten Informationen über soziale Ereignisse, Bildung, Gesundheit und Demografie.',
  },
  'Polityka': {
    pl: 'Wiadomości polityczne. AI agreguje najważniejsze informacje o polityce krajowej i zagranicznej z wielu źródeł.',
    en: 'Political news. AI aggregates the most important domestic and foreign policy information from multiple sources.',
    de: 'Politische Nachrichten. KI aggregiert die wichtigsten innen- und außenpolitischen Informationen aus mehreren Quellen.',
  },
  'Sport': {
    pl: 'Najnowsze wiadomości sportowe. AI agreguje wyniki, transfery i najważniejsze wydarzenia ze świata sportu.',
    en: 'Latest sports news. AI aggregates scores, transfers and the most important events from the world of sports.',
    de: 'Neueste Sportnachrichten. KI aggregiert Ergebnisse, Transfers und die wichtigsten Ereignisse aus der Sportwelt.',
  },
  'Kultura': {
    pl: 'Wiadomości kulturalne. AI agreguje najważniejsze informacje o kulturze, sztuce, muzyce, filmie i rozrywce.',
    en: 'Culture news. AI aggregates the most important information about arts, music, film and entertainment.',
    de: 'Kulturnachrichten. KI aggregiert die wichtigsten Informationen über Kunst, Musik, Film und Unterhaltung.',
  },
  'Przestępczość': {
    pl: 'Wiadomości o przestępczości i bezpieczeństwie. AI agreguje najważniejsze informacje o zdarzeniach kryminalnych i wymiarze sprawiedliwości.',
    en: 'Crime and safety news. AI aggregates the most important information about criminal events and justice.',
    de: 'Kriminalitäts- und Sicherheitsnachrichten. KI aggregiert die wichtigsten Informationen über kriminelle Ereignisse und Justiz.',
  },
  'Styl Życia': {
    pl: 'Wiadomości lifestylowe. AI agreguje najważniejsze informacje o zdrowiu, modzie, podróżach i stylu życia.',
    en: 'Lifestyle news. AI aggregates the most important information about health, fashion, travel and lifestyle.',
    de: 'Lifestyle-Nachrichten. KI aggregiert die wichtigsten Informationen über Gesundheit, Mode, Reisen und Lebensstil.',
  },
  'Pogoda i Środowisko': {
    pl: 'Wiadomości o pogodzie i środowisku. AI agreguje najważniejsze informacje o zmianach klimatycznych, ekologii i prognozach pogody.',
    en: 'Weather and environment news. AI aggregates the most important information about climate change, ecology and weather forecasts.',
    de: 'Wetter- und Umweltnachrichten. KI aggregiert die wichtigsten Informationen über Klimawandel, Ökologie und Wettervorhersagen.',
  },
  'Nauka i Technologia': {
    pl: 'Wiadomości naukowe i technologiczne. AI agreguje najważniejsze odkrycia, innowacje i trendy technologiczne.',
    en: 'Science and technology news. AI aggregates the most important discoveries, innovations and tech trends.',
    de: 'Wissenschafts- und Technologienachrichten. KI aggregiert die wichtigsten Entdeckungen, Innovationen und Techniktrends.',
  },
};

// Slug utilities (mirrors frontend createSlug from src/utils/slug.ts)
import { createSlug } from '../utils/text.js';

// Build slug → Polish category lookup per language
const SLUG_TO_CATEGORY = {};
for (const lang of ['pl', 'en', 'de']) {
  SLUG_TO_CATEGORY[lang] = {};
  for (const [polishName, translations] of Object.entries(CATEGORY_TRANSLATIONS)) {
    if (polishName === 'Inne') continue; // Skip "Other" category
    const slug = createSlug(translations[lang]);
    SLUG_TO_CATEGORY[lang][slug] = polishName;
  }
}

/** Resolve a URL slug to the Polish category name, or null */
export function getCategoryFromSlug(slug, lang = 'pl') {
  return SLUG_TO_CATEGORY[lang]?.[slug] ?? null;
}

/** Get the translated category name for a Polish category */
export function getCategoryTitle(polishCategory, lang = 'pl') {
  return CATEGORY_TRANSLATIONS[polishCategory]?.[lang] || polishCategory;
}

/** Get the SEO description for a category */
export function getCategoryDescription(polishCategory, lang = 'pl') {
  return CATEGORY_DESCRIPTIONS[polishCategory]?.[lang] || CATEGORY_DESCRIPTIONS[polishCategory]?.pl || '';
}

// Breadcrumb segment name mapping
export const BREADCRUMB_NAMES = {
  sejm: 'Sejm',
  dane: 'Dane',
  srodowisko: 'Środowisko',
  spoleczenstwo: 'Społeczeństwo',
  ekonomia: 'Ekonomia',
  transport: 'Transport',
  bezpieczenstwo: 'Bezpieczeństwo'
};

// RSS Feed descriptions per language
export const RSS_DESCRIPTIONS = {
  pl: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia.',
  en: 'All the most important news in one place. AI organizes and summarizes today\'s events.',
  de: 'Alle wichtigen Nachrichten an einem Ort. KI organisiert und fasst die Ereignisse des Tages zusammen.'
};
