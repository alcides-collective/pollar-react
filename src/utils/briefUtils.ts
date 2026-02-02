/**
 * Utility functions for Daily Brief display
 */

export type AppLanguage = 'pl' | 'en' | 'ua';

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
  'ua': {
    0: 'Опівнічний огляд',
    1: 'Після півночі',
    2: 'Глибока ніч',
    3: 'Ніч з Pollar',
    4: 'Перед світанком',
    5: 'На світанку',
    6: 'Ранній ранок',
    7: 'Ранкові новини',
    8: 'Ранок з Pollar',
    9: 'Передобідній бріф',
    10: 'Пізній ранок',
    11: 'Перед полуднем',
    12: 'Опівдні',
    13: 'Початок дня',
    14: 'Післяобідній бріф',
    15: 'Післяобідній огляд',
    16: 'Пізній день',
    17: 'Кінець робочого дня',
    18: 'Ранній вечір',
    19: 'Вечірній бріф',
    20: 'Вечір з Pollar',
    21: 'Пізній вечір',
    22: 'Перед ніччю',
    23: 'Нічне резюме'
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

  const locale = lang === 'en' ? 'en-US' : lang === 'ua' ? 'uk-UA' : 'pl-PL';
  return d.toLocaleDateString(locale, options);
}
