const categoryTranslations: Record<string, string> = {
  politics: 'Polityka',
  economy: 'Gospodarka',
  world: 'Świat',
  technology: 'Technologia',
  science: 'Nauka',
  health: 'Zdrowie',
  sport: 'Sport',
  culture: 'Kultura',
  entertainment: 'Rozrywka',
  society: 'Społeczeństwo',
  environment: 'Środowisko',
  business: 'Biznes',
  finance: 'Finanse',
  crime: 'Prawo',
  education: 'Edukacja',
  lifestyle: 'Styl życia',
  travel: 'Podróże',
  food: 'Jedzenie',
  automotive: 'Motoryzacja',
  weather: 'Pogoda',
};

export function translateCategory(category: string): string {
  return categoryTranslations[category.toLowerCase()] || category;
}
