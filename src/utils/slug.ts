/**
 * URL slug utilities for SEO-friendly event and felieton URLs.
 * Slugs are decorative — routing always uses the ID, slug is optional.
 */

const CHAR_MAP: Record<string, string> = {
  // Polish
  'ą': 'a', 'ć': 'c', 'ę': 'e', 'ł': 'l', 'ń': 'n', 'ó': 'o', 'ś': 's', 'ź': 'z', 'ż': 'z',
  'Ą': 'A', 'Ć': 'C', 'Ę': 'E', 'Ł': 'L', 'Ń': 'N', 'Ó': 'O', 'Ś': 'S', 'Ź': 'Z', 'Ż': 'Z',
  // German
  'ä': 'ae', 'ö': 'oe', 'ü': 'ue', 'ß': 'ss',
  'Ä': 'Ae', 'Ö': 'Oe', 'Ü': 'Ue',
};

const CHAR_REGEX = /[ąćęłńóśźżĄĆĘŁŃÓŚŹŻäöüßÄÖÜ]/g;

export function createSlug(text: string | undefined): string {
  if (!text) return '';
  return text
    .replace(CHAR_REGEX, (ch) => CHAR_MAP[ch] || ch)
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function eventPath(event: { id: string; title?: string; metadata?: { ultraShortHeadline?: string } }): string {
  const slug = createSlug(event.metadata?.ultraShortHeadline || event.title);
  return slug ? `/event/${event.id}/${slug}` : `/event/${event.id}`;
}

export function felietonPath(felieton: { id: string; title?: string; ultraShortHeadline?: string }): string {
  const slug = createSlug(felieton.ultraShortHeadline || felieton.title);
  return slug ? `/felieton/${felieton.id}/${slug}` : `/felieton/${felieton.id}`;
}

export function mpPath(mp: { id: number; firstLastName: string }): string {
  const slug = createSlug(mp.firstLastName);
  return slug ? `/sejm/poslowie/${mp.id}/${slug}` : `/sejm/poslowie/${mp.id}`;
}
