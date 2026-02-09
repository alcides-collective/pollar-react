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

// Country translations (mirrors frontend src/utils/countrySlug.ts)
export const COUNTRY_TRANSLATIONS = {
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

// Country SEO descriptions — rich, unique per country per language
const COUNTRY_DESCRIPTIONS = {
  'Polska': {
    pl: 'Wiadomości z Polski — polityka, gospodarka, społeczeństwo i sport. AI agreguje najważniejsze wydarzenia z polskich i zagranicznych mediów w jednym miejscu.',
    en: 'News from Poland — politics, economy, society and sports. AI aggregates the most important events from Polish and international media in one place.',
    de: 'Nachrichten aus Polen — Politik, Wirtschaft, Gesellschaft und Sport. KI aggregiert die wichtigsten Ereignisse aus polnischen und internationalen Medien.',
  },
  'Niemcy': {
    pl: 'Wiadomości z Niemiec — polityka Bundestagu, gospodarka strefy euro, relacje polsko-niemieckie. AI podsumowuje najważniejsze wydarzenia.',
    en: 'News from Germany — Bundestag politics, eurozone economy, industry and trade. AI summarizes the most important events from German media.',
    de: 'Nachrichten aus Deutschland — Bundestag-Politik, Wirtschaft, Industrie und Handel. KI fasst die wichtigsten Ereignisse aus deutschen Medien zusammen.',
  },
  'Włochy': {
    pl: 'Wiadomości z Włoch — polityka, gospodarka, kultura i sport. Serie A, Watykan, wydarzenia w basenie Morza Śródziemnego.',
    en: 'News from Italy — politics, economy, culture and sports. Serie A, the Vatican, and Mediterranean affairs.',
    de: 'Nachrichten aus Italien — Politik, Wirtschaft, Kultur und Sport. Serie A, der Vatikan und das Geschehen im Mittelmeerraum.',
  },
  'USA': {
    pl: 'Wiadomości z USA — polityka Białego Domu i Kongresu, Wall Street, technologia z Doliny Krzemowej. AI agreguje media amerykańskie i polskie relacje.',
    en: 'News from the USA — White House and Congress politics, Wall Street, Silicon Valley tech. AI aggregates American and international media coverage.',
    de: 'Nachrichten aus den USA — Politik des Weißen Hauses und des Kongresses, Wall Street, Technologie aus dem Silicon Valley. KI aggregiert amerikanische Medienberichte.',
  },
  'Hiszpania': {
    pl: 'Wiadomości z Hiszpanii — polityka, gospodarka, La Liga i kultura. AI podsumowuje najważniejsze wydarzenia z Półwyspu Iberyjskiego.',
    en: 'News from Spain — politics, economy, La Liga and culture. AI summarizes the most important events from the Iberian Peninsula.',
    de: 'Nachrichten aus Spanien — Politik, Wirtschaft, La Liga und Kultur. KI fasst die wichtigsten Ereignisse der Iberischen Halbinsel zusammen.',
  },
  'Francja': {
    pl: 'Wiadomości z Francji — polityka Pałacu Elizejskiego, gospodarka, protesty społeczne i kultura. AI agreguje francuskie i międzynarodowe media.',
    en: 'News from France — Élysée Palace politics, economy, social movements and culture. AI aggregates French and international media.',
    de: 'Nachrichten aus Frankreich — Élysée-Politik, Wirtschaft, soziale Bewegungen und Kultur. KI aggregiert französische und internationale Medien.',
  },
  'Rosja': {
    pl: 'Wiadomości z Rosji — polityka Kremla, sankcje, konflikt z Ukrainą, gospodarka. AI agreguje relacje z mediów międzynarodowych.',
    en: 'News from Russia — Kremlin politics, sanctions, the conflict with Ukraine, economy. AI aggregates reports from international media.',
    de: 'Nachrichten aus Russland — Kreml-Politik, Sanktionen, der Konflikt mit der Ukraine, Wirtschaft. KI aggregiert Berichte aus internationalen Medien.',
  },
  'Ukraina': {
    pl: 'Wiadomości z Ukrainy — wojna, polityka, pomoc międzynarodowa i odbudowa. AI agreguje relacje z ukraińskich i światowych mediów.',
    en: 'News from Ukraine — war, politics, international aid and reconstruction. AI aggregates reports from Ukrainian and global media.',
    de: 'Nachrichten aus der Ukraine — Krieg, Politik, internationale Hilfe und Wiederaufbau. KI aggregiert Berichte aus ukrainischen und weltweiten Medien.',
  },
  'Austria': {
    pl: 'Wiadomości z Austrii — polityka, gospodarka, relacje z UE i Europą Środkową. AI podsumowuje najważniejsze wydarzenia.',
    en: 'News from Austria — politics, economy, EU relations and Central European affairs. AI summarizes the most important events.',
    de: 'Nachrichten aus Österreich — Politik, Wirtschaft, EU-Beziehungen und mitteleuropäische Angelegenheiten. KI fasst die wichtigsten Ereignisse zusammen.',
  },
  'Wielka Brytania': {
    pl: 'Wiadomości z Wielkiej Brytanii — polityka Westminsteru, gospodarka post-Brexit, Premier League. AI agreguje brytyjskie i międzynarodowe media.',
    en: 'News from the United Kingdom — Westminster politics, post-Brexit economy, Premier League. AI aggregates British and international media.',
    de: 'Nachrichten aus Großbritannien — Westminster-Politik, Post-Brexit-Wirtschaft, Premier League. KI aggregiert britische und internationale Medien.',
  },
  'Chiny': {
    pl: 'Wiadomości z Chin — polityka Pekinu, handel międzynarodowy, technologia i geopolityka. AI agreguje relacje z mediów światowych.',
    en: 'News from China — Beijing politics, international trade, technology and geopolitics. AI aggregates reports from global media.',
    de: 'Nachrichten aus China — Pekings Politik, internationaler Handel, Technologie und Geopolitik. KI aggregiert Berichte aus weltweiten Medien.',
  },
  'Czechy': {
    pl: 'Wiadomości z Czech — polityka, gospodarka, relacje polsko-czeskie i sprawy Grupy Wyszehradzkiej. AI podsumowuje najważniejsze wydarzenia.',
    en: 'News from the Czech Republic — politics, economy, and Visegrád Group affairs. AI summarizes the most important events.',
    de: 'Nachrichten aus Tschechien — Politik, Wirtschaft und Visegrád-Angelegenheiten. KI fasst die wichtigsten Ereignisse zusammen.',
  },
  'Szwajcaria': {
    pl: 'Wiadomości ze Szwajcarii — finanse, bankowość, neutralność i polityka europejska. AI agreguje media szwajcarskie i międzynarodowe.',
    en: 'News from Switzerland — finance, banking, neutrality and European politics. AI aggregates Swiss and international media.',
    de: 'Nachrichten aus der Schweiz — Finanzen, Bankwesen, Neutralität und europäische Politik. KI aggregiert Schweizer und internationale Medien.',
  },
  'Izrael': {
    pl: 'Wiadomości z Izraela — konflikt bliskowschodni, polityka, technologia i bezpieczeństwo. AI agreguje relacje z mediów międzynarodowych.',
    en: 'News from Israel — Middle East conflict, politics, technology and security. AI aggregates reports from international media.',
    de: 'Nachrichten aus Israel — Nahostkonflikt, Politik, Technologie und Sicherheit. KI aggregiert Berichte aus internationalen Medien.',
  },
  'Holandia': {
    pl: 'Wiadomości z Holandii — polityka, gospodarka, handel i innowacje. AI podsumowuje najważniejsze wydarzenia z Niderlandów.',
    en: 'News from the Netherlands — politics, economy, trade and innovation. AI summarizes the most important events.',
    de: 'Nachrichten aus den Niederlanden — Politik, Wirtschaft, Handel und Innovation. KI fasst die wichtigsten Ereignisse zusammen.',
  },
};

// Build slug → Polish country lookup per language
const SLUG_TO_COUNTRY = {};
for (const lang of ['pl', 'en', 'de']) {
  SLUG_TO_COUNTRY[lang] = {};
  for (const [polishName, translations] of Object.entries(COUNTRY_TRANSLATIONS)) {
    const slug = createSlug(translations[lang]);
    SLUG_TO_COUNTRY[lang][slug] = polishName;
  }
}

/** Resolve a URL slug to the Polish country name, or null */
export function getCountryFromSlug(slug, lang = 'pl') {
  return SLUG_TO_COUNTRY[lang]?.[slug] ?? null;
}

/** Get the translated country name for a Polish country key */
export function getCountryTitle(polishCountry, lang = 'pl') {
  return COUNTRY_TRANSLATIONS[polishCountry]?.[lang] || polishCountry;
}

/** Get the SEO description for a country */
export function getCountryDescription(polishCountry, lang = 'pl') {
  return COUNTRY_DESCRIPTIONS[polishCountry]?.[lang] || COUNTRY_DESCRIPTIONS[polishCountry]?.pl || '';
}

/** Parse country slugs param (e.g. "polska+niemcy") into array of Polish keys */
export function parseCountrySlugs(param, lang = 'pl') {
  return param.split('+').map(s => getCountryFromSlug(s, lang)).filter(Boolean);
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
