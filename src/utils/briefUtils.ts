/**
 * Utility functions for Daily Brief display
 */

export type AppLanguage = 'pl' | 'en' | 'de';

// Time-based headlines for each hour of the day
export const HOURLY_HEADLINES: Record<AppLanguage, Record<number, string>> = {
  'pl': {
    0: 'Północ',
    1: 'Po północy',
    2: 'Głęboka noc',
    3: 'Noc z Pollar',
    4: 'Przed świtem',
    5: 'O świcie',
    6: 'Ranek',
    7: 'Poranne wiadomości',
    8: 'Poranek z Pollar',
    9: 'Późny poranek',
    10: 'Przedpołudnie',
    11: 'Przed południem',
    12: 'Południe',
    13: 'Po południu',
    14: 'Popołudnie',
    15: 'Popołudniowy przegląd',
    16: 'Późne popołudnie',
    17: 'Pod wieczór',
    18: 'Wczesny wieczór',
    19: 'Wieczorne wiadomości',
    20: 'Wieczór z Pollar',
    21: 'Późny wieczór',
    22: 'Przed północą',
    23: 'Nocne podsumowanie'
  },
  'en': {
    0: 'Midnight Review',
    1: 'After Midnight',
    2: 'Late Night',
    3: 'Night with Pollar',
    4: 'Before Dawn',
    5: 'Dawn Breaking',
    6: 'Early Morning',
    7: 'Morning News',
    8: 'Morning with Pollar',
    9: 'Mid-Morning Brief',
    10: 'Late Morning',
    11: 'Before Noon',
    12: 'High Noon',
    13: 'Early Afternoon',
    14: 'Afternoon Brief',
    15: 'Afternoon Review',
    16: 'Late Afternoon',
    17: 'End of Workday',
    18: 'Early Evening',
    19: 'Evening Brief',
    20: 'Evening with Pollar',
    21: 'Late Evening',
    22: 'Before Night',
    23: 'Night Summary'
  },
  'de': {
    0: 'Mitternachtsüberblick',
    1: 'Nach Mitternacht',
    2: 'Späte Nacht',
    3: 'Nacht mit Pollar',
    4: 'Vor der Dämmerung',
    5: 'Morgendämmerung',
    6: 'Früher Morgen',
    7: 'Morgennachrichten',
    8: 'Morgen mit Pollar',
    9: 'Vormittagsüberblick',
    10: 'Später Vormittag',
    11: 'Vor dem Mittag',
    12: 'Mittag',
    13: 'Früher Nachmittag',
    14: 'Nachmittagsüberblick',
    15: 'Nachmittagsrückblick',
    16: 'Später Nachmittag',
    17: 'Feierabend',
    18: 'Früher Abend',
    19: 'Abendnachrichten',
    20: 'Abend mit Pollar',
    21: 'Später Abend',
    22: 'Vor der Nacht',
    23: 'Nachtzusammenfassung'
  }
};

/**
 * Returns a time-based headline based on current hour
 */
export function getTimeBasedHeadline(lang: AppLanguage = 'pl'): string {
  const hour = new Date().getHours();
  return HOURLY_HEADLINES[lang]?.[hour] || HOURLY_HEADLINES['pl'][hour];
}

/**
 * Formats the brief date for display
 */
export function formatBriefDate(date: string | Date, lang: AppLanguage = 'pl'): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  };

  const locale = lang === 'en' ? 'en-US' : lang === 'de' ? 'de-DE' : 'pl-PL';
  return d.toLocaleDateString(locale, options);
}
