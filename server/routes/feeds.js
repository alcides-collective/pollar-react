import { Router } from 'express';
import { API_BASE } from '../config.js';
import { PAGE_TITLES } from '../data/pageTitles.js';
import { RSS_DESCRIPTIONS } from '../data/translations.js';
import { createSlug, escapeXml, stripHtml } from '../utils/text.js';

export const feedRoutes = Router();

// Sitemap.xml endpoint with dynamic events and multilingual support
feedRoutes.get('/sitemap.xml', async (req, res) => {
  const baseUrl = 'https://pollar.news';
  const LANGUAGES = ['pl', 'en', 'de'];

  // Helper to generate xhtml:link tags for all language versions
  const generateHreflangLinks = (path) => {
    // Strip slug from event/felieton paths — each language has its own slug
    // Slug-less URLs work fine since :slug? is optional in routing
    const hreflangPath = path
      .replace(/^(\/event\/[^/?#/]+)\/[^/?#]+/, '$1')
      .replace(/^(\/felieton\/[^/?#/]+)\/[^/?#]+/, '$1');
    const plUrl = `${baseUrl}${hreflangPath}`;
    const enUrl = `${baseUrl}/en${hreflangPath}`;
    const deUrl = `${baseUrl}/de${hreflangPath}`;
    return `
      <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}"/>
      <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
      <xhtml:link rel="alternate" hreflang="de" href="${deUrl}"/>
      <xhtml:link rel="alternate" hreflang="x-default" href="${plUrl}"/>`;
  };

  // Helper to generate a complete URL entry with hreflang and optional lastmod
  const generateUrlEntry = (path, lastmod = null) => {
    const loc = `${baseUrl}${path}`;
    const lastmodTag = lastmod ? `\n    <lastmod>${new Date(lastmod).toISOString()}</lastmod>` : '';
    return `  <url>
    <loc>${loc}</loc>${lastmodTag}${generateHreflangLinks(path)}
  </url>`;
  };

  // Static pages from PAGE_TITLES
  const staticPages = Object.keys(PAGE_TITLES).filter(path => path !== '/brief');

  // Add /brief separately
  staticPages.push('/brief');

  // Fetch events from both API endpoints and deduplicate
  const eventMap = new Map();
  try {
    const [eventsRes, archiveRes] = await Promise.all([
      fetch(`${API_BASE}/api/events?lang=pl&limit=1000`),
      fetch(`${API_BASE}/api/events/archive?lang=pl&limit=5000`),
    ]);
    for (const res of [eventsRes, archiveRes]) {
      if (res.ok) {
        const data = await res.json();
        const items = Array.isArray(data) ? data : (data.data || data.events || []);
        for (const e of items) {
          if (e.id && !eventMap.has(e.id)) eventMap.set(e.id, e);
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch events for sitemap:', err.message);
  }
  const events = [...eventMap.values()];

  // Fetch felietony from API
  let felietony = [];
  try {
    const response = await fetch(`${API_BASE}/api/felietony?lang=pl&limit=100`);
    if (response.ok) {
      const data = await response.json();
      // API returns { data: [...] } or { felietony: [...] } or direct array
      felietony = Array.isArray(data) ? data : (data.data || data.felietony || []);
    }
  } catch (err) {
    console.warn('Could not fetch felietony for sitemap:', err.message);
  }

  // Generate XML with multilingual support
  const urls = [
    ...staticPages.map(path => generateUrlEntry(path)),
    ...events.map(e => {
      const slug = createSlug(e.metadata?.ultraShortHeadline || e.title);
      return generateUrlEntry(slug ? `/event/${e.id}/${slug}` : `/event/${e.id}`, e.updatedAt || e.createdAt);
    }),
    ...felietony.map(f => {
      const slug = createSlug(f.ultraShortHeadline || f.title);
      return generateUrlEntry(slug ? `/felieton/${f.id}/${slug}` : `/felieton/${f.id}`, f.updatedAt || f.createdAt);
    }),
    // External: status page (no hreflang — language-independent)
    `  <url>
    <loc>https://status.pollar.news/</loc>
  </url>`,
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=3600'); // Cache for 1 hour
  res.send(xml);
});

// Google News Sitemap — only events from last 2 days (Google News requirement)
// Separate endpoints per language (Google requires one news sitemap per language)
feedRoutes.get(['/:lang(en|de)/news-sitemap.xml', '/news-sitemap.xml'], async (req, res) => {
  const lang = req.params.lang || 'pl';
  const langPrefix = lang !== 'pl' ? `/${lang}` : '';
  const baseUrl = 'https://pollar.news';

  // Fetch from both endpoints and deduplicate
  const eventMap = new Map();
  try {
    const [eventsRes, archiveRes] = await Promise.all([
      fetch(`${API_BASE}/api/events?lang=${lang}&limit=200`),
      fetch(`${API_BASE}/api/events/archive?lang=${lang}&limit=200`),
    ]);
    for (const r of [eventsRes, archiveRes]) {
      if (r.ok) {
        const data = await r.json();
        const items = Array.isArray(data) ? data : (data.data || data.events || []);
        for (const e of items) {
          if (e.id && !eventMap.has(e.id)) eventMap.set(e.id, e);
        }
      }
    }
  } catch (err) {
    console.warn('Could not fetch events for news sitemap:', err.message);
  }
  let events = [...eventMap.values()];

  // Filter to last 2 days only (Google News requirement)
  const twoDaysAgo = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000);
  events = events.filter(e => {
    const date = new Date(e.createdAt || e.date);
    return date >= twoDaysAgo;
  });

  const urls = events.map(e => {
    const slug = createSlug(e.metadata?.ultraShortHeadline || e.title);
    const loc = slug ? `${baseUrl}${langPrefix}/event/${e.id}/${slug}` : `${baseUrl}${langPrefix}/event/${e.id}`;
    const pubDate = e.createdAt || e.date || new Date().toISOString();
    const title = escapeXml(stripHtml(e.title || ''));
    const keywordParts = [
      e.category || e.metadata?.category,
      ...(e.metadata?.seo?.keywords || []),
      ...(e.metadata?.mentionedPeople?.map(p => p.name) || []).slice(0, 3),
      ...(e.metadata?.mentionedCountries || []).slice(0, 3),
    ].filter(Boolean);
    const keywords = keywordParts.length > 0 ? `\n      <news:keywords>${escapeXml(keywordParts.join(', '))}</news:keywords>` : '';

    return `  <url>
    <loc>${loc}</loc>
    <news:news>
      <news:publication>
        <news:name>Pollar News</news:name>
        <news:language>${lang}</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${title}</news:title>${keywords}
    </news:news>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  res.set('Content-Type', 'application/xml');
  res.set('Cache-Control', 'public, max-age=900'); // 15 minutes — fresh news
  res.send(xml);
});

// RSS Feed endpoint (supports /feed.xml, /en/feed.xml, /de/feed.xml)
feedRoutes.get(['/:lang(en|de)/feed.xml', '/feed.xml'], async (req, res) => {
  const lang = req.params.lang || 'pl';
  const langPrefix = lang !== 'pl' ? `/${lang}` : '';
  const baseUrl = 'https://pollar.news';

  // Fetch all events from API (limit=500 to get all, API doesn't support sorting)
  let events = [];
  try {
    const response = await fetch(`${API_BASE}/api/events?lang=${lang}&limit=500`);
    if (response.ok) {
      const data = await response.json();
      // API returns { data: [...] } or { events: [...] } or direct array
      events = Array.isArray(data) ? data : (data.data || data.events || []);
    }
  } catch (err) {
    console.warn('Could not fetch events for RSS:', err.message);
  }

  // Sort by createdAt descending and take top 50 for RSS
  events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  events = events.slice(0, 50);

  const now = new Date().toUTCString();

  const items = events.map(e => {
    const title = escapeXml(stripHtml(e.title || ''));
    const lead = escapeXml(stripHtml(e.lead || e.summary || ''));
    const slug = createSlug(e.metadata?.ultraShortHeadline || stripHtml(e.title || ''));
    const eventPath = slug ? `/event/${e.id}/${slug}` : `/event/${e.id}`;
    const link = `${baseUrl}${langPrefix}${eventPath}`;
    const pubDate = e.createdAt ? new Date(e.createdAt).toUTCString() : now;
    const guid = `${baseUrl}/event/${e.id}`; // guid stays canonical ID-based (never changes)

    return `    <item>
      <title>${title}</title>
      <description>${lead}</description>
      <link>${link}</link>
      <guid isPermaLink="true">${guid}</guid>
      <pubDate>${pubDate}</pubDate>
      <creativeCommons:license>https://creativecommons.org/licenses/by-nc-sa/4.0/</creativeCommons:license>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:creativeCommons="http://backend.userland.com/creativeCommonsRssModule">
  <channel>
    <title>Pollar News</title>
    <description>${RSS_DESCRIPTIONS[lang]}</description>
    <link>${baseUrl}${langPrefix}</link>
    <language>${lang}</language>
    <copyright>CC BY-NC-SA 4.0 - Pollar News (pollar.news)</copyright>
    <creativeCommons:license>https://creativecommons.org/licenses/by-nc-sa/4.0/</creativeCommons:license>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}${langPrefix}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  res.set('Content-Type', 'application/rss+xml');
  res.set('Cache-Control', 'public, max-age=1800'); // Cache for 30 minutes
  res.send(rss);
});
