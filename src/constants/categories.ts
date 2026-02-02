export const CATEGORY_ORDER = [
  'Świat',
  'Gospodarka',
  'Społeczeństwo',
  'Polityka',
  'Sport',
  'Kultura',
  'Przestępczość',
  'Styl Życia',
  'Pogoda i Środowisko',
  'Nauka i Technologia',
];

export function sortByCategory<T extends { category?: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const indexA = CATEGORY_ORDER.indexOf(a.category || '');
    const indexB = CATEGORY_ORDER.indexOf(b.category || '');
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
}
