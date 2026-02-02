const API_BASE = 'https://pollar.up.railway.app/api';

// Default meta values
const DEFAULT_META = {
  title: 'Pollar News',
  ogTitle: 'Pollar News',
  ogDescription: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.',
  ogType: 'website',
  ogImage: '/opengraph-image.jpg',
};

// Helper to strip HTML tags
function stripHtml(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

// Helper to truncate text
function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '…';
  }
  return truncated.slice(0, maxLength - 1) + '…';
}

// Fetch event metadata
async function fetchEventMeta(eventId, origin) {
  try {
    const response = await fetch(`${API_BASE}/events/${eventId}?lang=pl`);
    if (!response.ok) return null;

    const event = await response.json();
    const title = event.metadata?.ultraShortHeadline || event.title || DEFAULT_META.title;
    const fullTitle = event.title || DEFAULT_META.ogTitle;
    const description = stripHtml(event.metadata?.keyPoints?.[0]?.description || event.summary || '');

    return {
      title: `${title} | Pollar News`,
      ogTitle: title,
      ogDescription: truncate(description, 160),
      ogType: 'article',
      ogImage: `${origin}/api/og?title=${encodeURIComponent(fullTitle)}&type=event`,
    };
  } catch (e) {
    console.error('Error fetching event:', e);
    return null;
  }
}

// Fetch brief metadata
async function fetchBriefMeta(origin) {
  try {
    const response = await fetch(`${API_BASE}/brief?lang=pl`);
    if (!response.ok) return null;

    const result = await response.json();
    const brief = result.data;
    if (!brief) return null;

    const date = new Date(brief.date).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const title = `Daily Brief – ${date}`;
    const imageTitle = brief.headline || title;

    return {
      title: `${title} | Pollar News`,
      ogTitle: title,
      ogDescription: truncate(stripHtml(brief.lead || brief.executiveSummary || ''), 160),
      ogType: 'article',
      ogImage: `${origin}/api/og?title=${encodeURIComponent(imageTitle)}&type=brief`,
    };
  } catch (e) {
    console.error('Error fetching brief:', e);
    return null;
  }
}

// Fetch felieton metadata
async function fetchFelietonMeta(felietonId, origin) {
  try {
    const response = await fetch(`${API_BASE}/felietony/${felietonId}?lang=pl`);
    if (!response.ok) return null;

    const result = await response.json();
    const felieton = result.data;
    if (!felieton) return null;

    const title = felieton.title || DEFAULT_META.title;

    return {
      title: `${title} | Pollar News`,
      ogTitle: title,
      ogDescription: truncate(stripHtml(felieton.lead || ''), 160),
      ogType: 'article',
      ogImage: `${origin}/api/og?title=${encodeURIComponent(title)}&type=felieton`,
    };
  } catch (e) {
    console.error('Error fetching felieton:', e);
    return null;
  }
}

// Replace placeholders in HTML
function replacePlaceholders(html, meta) {
  return html
    .replace(/__META_TITLE__/g, meta.title)
    .replace(/__OG_TITLE__/g, meta.ogTitle)
    .replace(/__OG_DESCRIPTION__/g, meta.ogDescription)
    .replace(/__OG_TYPE__/g, meta.ogType)
    .replace(/__OG_IMAGE__/g, meta.ogImage);
}

export const config = {
  matcher: ['/', '/event/:path*', '/brief', '/felieton/:path*'],
};

export default async function middleware(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  const origin = url.origin;

  // Skip API routes and static assets
  if (pathname.startsWith('/api/') ||
      pathname.startsWith('/assets/') ||
      pathname.includes('.')) {
    return;
  }

  // Determine which meta to fetch based on route
  let meta = null;

  // Event page: /event/:id
  const eventMatch = pathname.match(/^\/event\/([^/]+)$/);
  if (eventMatch) {
    meta = await fetchEventMeta(eventMatch[1], origin);
  }

  // Brief page: /brief
  if (pathname === '/brief') {
    meta = await fetchBriefMeta(origin);
  }

  // Felieton page: /felieton/:id
  const felietonMatch = pathname.match(/^\/felieton\/([^/]+)$/);
  if (felietonMatch) {
    meta = await fetchFelietonMeta(felietonMatch[1], origin);
  }

  // Use default meta if fetch failed or route not matched
  if (!meta) {
    meta = DEFAULT_META;
    meta.title = 'Pollar News';
  }

  // Fetch the original response
  const response = await fetch(request);
  const html = await response.text();

  // Replace placeholders
  const modifiedHtml = replacePlaceholders(html, meta);

  // Return modified response
  return new Response(modifiedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers: {
      ...Object.fromEntries(response.headers.entries()),
      'content-type': 'text/html; charset=utf-8',
    },
  });
}
