import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE || 'https://pollar.up.railway.app';

// Crawler detection
const CRAWLER_USER_AGENTS = [
  'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
  'Slackbot', 'TelegramBot', 'Discordbot', 'Googlebot', 'bingbot', 'Applebot',
  'PetalBot', 'Sogou', 'YandexBot', 'Embedly', 'Pinterest', 'Skype', 'vkShare',
  'redditbot', 'Mediapartners-Google'
];

function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  return CRAWLER_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()));
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function stripHtml(text) {
  if (!text) return '';
  return text.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}

function truncate(text, maxLength) {
  if (!text || text.length <= maxLength) return text || '';
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  if (lastSpace > maxLength * 0.7) {
    return truncated.slice(0, lastSpace) + '…';
  }
  return truncated.slice(0, maxLength - 1) + '…';
}

function generateSeoHtml(opts) {
  const { pageTitle, ogTitle, description, ogImage, targetUrl, ogType = 'article' } = opts;
  return `<!doctype html>
<html lang="pl">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="Pollar" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${targetUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <meta http-equiv="refresh" content="0; url=${targetUrl}" />
    <link rel="canonical" href="${targetUrl}" />
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
  </head>
  <body>
    <p>Przekierowywanie… Jeśli strona się nie przeładuje, <a href="${targetUrl}">kliknij tutaj</a>.</p>
  </body>
</html>`;
}

// Fetch event data from API
async function fetchEventData(eventId) {
  try {
    const response = await fetch(`${API_BASE}/api/events/${eventId}?lang=pl`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch brief data from API
async function fetchBriefData() {
  try {
    const response = await fetch(`${API_BASE}/api/brief?lang=pl`);
    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

// Fetch felieton data from API
async function fetchFelietonData(felietonId) {
  try {
    const response = await fetch(`${API_BASE}/api/felietony/${felietonId}?lang=pl`);
    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

// Crawler middleware
app.use(async (req, res, next) => {
  if (!isCrawler(req.headers['user-agent'])) {
    return next();
  }

  const baseUrl = `${req.protocol}://${req.get('host')}`;
  const targetUrl = `${baseUrl}${req.path}`;

  // Event page
  const eventMatch = req.path.match(/^\/event\/([^/?#]+)/);
  if (eventMatch) {
    const event = await fetchEventData(eventMatch[1]);
    if (event) {
      const ogTitle = event.metadata?.ultraShortHeadline || event.title || 'Pollar';
      const fullTitle = event.title || 'Pollar';
      const kp = event.metadata?.keyPoints?.[0];
      const description = truncate(stripHtml(kp?.description || event.lead || event.summary || ''), 160);
      const ogImage = `${API_BASE}/api/og?title=${encodeURIComponent(fullTitle)}&type=event`;

      return res.send(generateSeoHtml({
        pageTitle: `${ogTitle} | Pollar`,
        ogTitle,
        description,
        ogImage,
        targetUrl
      }));
    }
  }

  // Brief page
  if (req.path === '/brief') {
    const brief = await fetchBriefData();
    let ogTitle = 'Daily Brief';
    let description = 'Podsumowanie najważniejszych wydarzeń dnia.';
    let imageTitle = ogTitle;

    if (brief) {
      const date = brief.date ? new Date(brief.date).toLocaleDateString('pl-PL', {
        day: 'numeric', month: 'long', year: 'numeric'
      }) : '';
      ogTitle = date ? `Daily Brief – ${date}` : 'Daily Brief';
      imageTitle = brief.headline || ogTitle;
      description = truncate(stripHtml(brief.lead || brief.executiveSummary || ''), 160);
    }

    const ogImage = `${API_BASE}/api/og?title=${encodeURIComponent(imageTitle)}&type=brief`;
    return res.send(generateSeoHtml({
      pageTitle: `${ogTitle} | Pollar`,
      ogTitle,
      description,
      ogImage,
      targetUrl
    }));
  }

  // Felieton page
  const felietonMatch = req.path.match(/^\/felieton\/([^/?#]+)/);
  if (felietonMatch) {
    const felieton = await fetchFelietonData(felietonMatch[1]);
    let ogTitle = 'Felieton';
    let description = 'Felieton Pollar News.';

    if (felieton) {
      ogTitle = felieton.title || ogTitle;
      description = truncate(stripHtml(felieton.lead || ''), 160);
    }

    const ogImage = `${API_BASE}/api/og?title=${encodeURIComponent(ogTitle)}&type=felieton`;
    return res.send(generateSeoHtml({
      pageTitle: `${ogTitle} | Pollar`,
      ogTitle,
      description,
      ogImage,
      targetUrl
    }));
  }

  // Homepage
  if (req.path === '/') {
    return res.send(generateSeoHtml({
      pageTitle: 'Pollar — Wiesz więcej',
      ogTitle: 'Pollar News',
      description: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.',
      ogImage: `${baseUrl}/og-image.jpg`,
      targetUrl: baseUrl,
      ogType: 'website'
    }));
  }

  next();
});

// Serve static files
app.use(express.static(join(__dirname, 'dist')));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
