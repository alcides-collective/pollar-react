import * as Sentry from '@sentry/node';

// Initialize Sentry FIRST (before other code runs)
if (process.env.SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV || 'production',
    tracesSampleRate: 0.1,
  });
}

import express from 'express';
import helmet from 'helmet';
import compression from 'compression';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const API_BASE = process.env.API_BASE || 'https://pollar.up.railway.app';

// Font family for SVG (must match installed font via fontconfig)
const FONT_FAMILY = "'HK Grotesk', 'Noto Sans', 'DejaVu Sans', sans-serif";

// Load logo buffer at startup for Sharp compositing
let logoBuffer = null;
try {
  logoBuffer = readFileSync(join(__dirname, 'server-assets/logo-white.png'));
  console.log('Logo loaded successfully');
} catch (err) {
  console.warn('Could not load logo:', err.message);
}

// Static page titles mapping
const PAGE_TITLES = {
  '/': { title: 'Pollar News', description: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.' },
  '/brief': null, // handled separately (dynamic)
  '/powiazania': { title: 'Powiązania', description: 'Codzienna gra słowna w stylu NYT Connections. Połącz 16 słów w 4 ukryte kategorie — masz tylko 4 szanse na błąd.' },
  '/mapa': { title: 'Mapa wydarzeń', description: 'Interaktywna mapa Polski z lokalizacją bieżących wydarzeń. Klikaj na markery, aby zobaczyć szczegóły i powiązane artykuły.' },
  '/terminal': { title: 'Terminal', description: 'Fullscreen dashboard z live-feedem trendujących wydarzeń. Nawiguj klawiaturą, śledź keypoints i notowania giełdowe w czasie rzeczywistym.' },
  '/polityka-prywatnosci': { title: 'Polityka prywatności', description: 'Polityka prywatności serwisu Pollar News.' },
  '/info': { title: 'O Pollar', description: 'Poznaj zespół i misję Pollar News — AI porządkuje wiadomości bez clickbaitów, żebyś był na bieżąco bez przytłaczania informacjami.' },
  '/graf': { title: 'Graf powiązań', description: 'Interaktywny graf sieciowy pokazujący powiązania między wydarzeniami. Wybierz tryb wizualizacji: force, radial, hierarchiczny lub timeline.' },
  '/gielda': { title: 'Giełda', description: 'Live notowania WIG20, mWIG40 i akcji GPW. Śledź największe wzrosty i spadki, twórz własną listę obserwowanych spółek.' },
  // Sejm
  '/sejm': { title: 'Sejm', description: 'Portal danych Sejmu RP X kadencji — statystyki, sondaże, bieżące posiedzenia live, rankingi posłów i ostatnie głosowania.' },
  '/sejm/poslowie': { title: 'Posłowie', description: 'Pełna lista 460 posłów z filtrami po klubie, województwie i aktywności. Profile z historią głosowań i frekwencją.' },
  '/sejm/kluby': { title: 'Kluby parlamentarne', description: 'Kluby i koła poselskie w Sejmie RP z liczbą członków, przewodniczącymi i statystykami głosowań.' },
  '/sejm/glosowania': { title: 'Głosowania', description: 'Archiwum wszystkich głosowań sejmowych z wynikami za/przeciw/wstrzymane i rozkładem głosów według klubów.' },
  '/sejm/komisje': { title: 'Komisje sejmowe', description: 'Lista komisji stałych, nadzwyczajnych i śledczych z zakresem działania, składem i harmonogramem posiedzeń.' },
  '/sejm/posiedzenia': { title: 'Posiedzenia', description: 'Kalendarz posiedzeń Sejmu z porządkiem obrad, harmonogramem i dostępem do transmisji na żywo.' },
  '/sejm/druki': { title: 'Druki sejmowe', description: 'Projekty ustaw, uchwał i innych dokumentów legislacyjnych z możliwością przejścia do pełnego tekstu.' },
  '/sejm/procesy': { title: 'Procesy legislacyjne', description: 'Śledzenie ścieżki legislacyjnej projektów ustaw od złożenia przez komisje do podpisu prezydenta.' },
  '/sejm/interpelacje': { title: 'Interpelacje', description: 'Pytania posłów kierowane do członków Rządu z odpowiedziami ministrów i terminami reakcji.' },
  '/sejm/zapytania': { title: 'Zapytania', description: 'Zapytania poselskie w sprawach bieżących kierowane do przedstawicieli Rady Ministrów.' },
  '/sejm/transmisje': { title: 'Transmisje', description: 'Transmisje video na żywo z obrad Sejmu, komisji i konferencji prasowych.' },
  // Dane
  '/dane': { title: 'Dane', description: 'Portal otwartych danych z wizualizacjami — jakość powietrza, energetyka, ceny mieszkań, przestępczość i więcej ze źródeł GIOŚ, GUS i Eurostat.' },
  '/dane/srodowisko/powietrze': { title: 'Jakość powietrza', description: 'Mapa stacji pomiarowych GIOŚ z live danymi PM2.5, PM10 i indeksem jakości. Ranking województw i top 10 najczystszych/najbardziej zanieczyszczonych lokalizacji.' },
  '/dane/spoleczenstwo/imiona': { title: 'Imiona', description: 'Ranking najpopularniejszych imion nadawanych w Polsce według danych GUS z podziałem na lata i płeć.' },
  '/dane/spoleczenstwo/nazwiska': { title: 'Nazwiska', description: 'Statystyki najpopularniejszych nazwisk w Polsce z analizą rozkładu geograficznego.' },
  '/dane/ekonomia/energia': { title: 'Energia', description: 'Mix energetyczny Polski: udział węgla, gazu, OZE i paliw płynnych. Ceny elektryczności i porównanie z krajami UE.' },
  '/dane/ekonomia/eurostat': { title: 'Eurostat', description: 'Wybrane wskaźniki makroekonomiczne Polski na tle Unii Europejskiej — PKB, inflacja, bezrobocie, handel.' },
  '/dane/ekonomia/mieszkania': { title: 'Ceny mieszkań', description: 'Średnie ceny za m² w największych miastach Polski z liczbą aktywnych ofert i trendami cenowymi.' },
  '/dane/transport/kolej': { title: 'Kolej', description: 'Statystyki przewozów pasażerskich i towarowych PKP z danymi o punktualności i obłożeniu tras.' },
  '/dane/transport/porty': { title: 'Porty', description: 'Przeładunki w portach Gdańsk, Gdynia, Szczecin i Świnoujście — tony, TEU i dynamika rok do roku.' },
  '/dane/bezpieczenstwo/przestepczosc': { title: 'Przestępczość', description: 'Statystyki Policji: liczba przestępstw, wykrywalność i ranking bezpieczeństwa województw.' },
  // Sources
  '/sources': { title: 'Źródła wiadomości', description: 'Wszystkie źródła wiadomości śledzone przez Pollar z klasyfikacją kapitałową i orientacją polityczną.' },
};

// Crawler detection
// Note: iMessage spoofs facebookexternalhit + Twitterbot, so it's already covered
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

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// OG Image generation endpoint
app.get('/api/og', async (req, res) => {
  const { title = 'Pollar News', type = 'default', description = '', lang = 'pl' } = req.query;

  const typeLabels = {
    event: { pl: 'WYDARZENIE', en: 'EVENT', de: 'EREIGNIS' },
    brief: { pl: 'DAILY BRIEF', en: 'DAILY BRIEF', de: 'DAILY BRIEF' },
    felieton: { pl: 'FELIETON', en: 'OPINION', de: 'KOLUMNE' },
    default: { pl: '', en: '', de: '' },
  };
  const typeLabel = typeLabels[type]?.[lang] || typeLabels[type]?.pl || '';

  // Calculate font size based on title length
  const fontSize = title.length > 100 ? 40 : title.length > 80 ? 48 : title.length > 50 ? 56 : 64;
  const lineHeight = Math.round(fontSize * 1.2);

  // Wrap text into lines
  const maxCharsPerLine = Math.floor(1080 / (fontSize * 0.5));
  const words = title.split(' ');
  const lines = [];
  let currentLine = '';

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (testLine.length <= maxCharsPerLine) {
      currentLine = testLine;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = word;
    }
  }
  if (currentLine) lines.push(currentLine);

  // Limit to ~6 lines max
  const maxLines = Math.floor(400 / lineHeight);
  const displayLines = lines.slice(0, maxLines);
  if (lines.length > maxLines && displayLines.length > 0) {
    const lastIndex = displayLines.length - 1;
    const lastLine = displayLines[lastIndex];
    if (lastLine) {
      displayLines[lastIndex] = lastLine.slice(0, -3) + '…';
    }
  }

  // Build SVG
  const width = 1200;
  const height = 630;
  const padding = 60;

  const textY = typeLabel ? 180 : 120;
  const textElements = displayLines
    .map((line, i) => {
      const y = textY + i * lineHeight;
      return `<text x="${padding}" y="${y}" font-size="${fontSize}" font-weight="700" fill="#fafafa">${escapeXml(line)}</text>`;
    })
    .join('\n');

  const typeLabelElement = typeLabel
    ? `<text x="${padding}" y="100" font-size="24" font-weight="600" fill="#a1a1aa" letter-spacing="0.1em">${escapeXml(typeLabel)}</text>`
    : '';

  // Description element - gray text below title with gradient fade
  const descriptionY = textY + displayLines.length * lineHeight + 6;
  const descriptionFontSize = 30;
  const descriptionLineHeight = 38;
  const logoRightMargin = 180; // Space for logo on the right
  const descriptionMaxWidth = width - padding - logoRightMargin;
  const descriptionMaxChars = Math.floor(descriptionMaxWidth / (descriptionFontSize * 0.5));

  // Wrap description into lines
  let descriptionLines = [];
  if (description) {
    const descWords = description.split(' ');
    let descCurrentLine = '';
    for (const word of descWords) {
      const testLine = descCurrentLine ? `${descCurrentLine} ${word}` : word;
      if (testLine.length <= descriptionMaxChars) {
        descCurrentLine = testLine;
      } else {
        if (descCurrentLine) descriptionLines.push(descCurrentLine);
        descCurrentLine = word;
      }
    }
    if (descCurrentLine) descriptionLines.push(descCurrentLine);
    // Limit to 4 lines max for description
    descriptionLines = descriptionLines.slice(0, 4);
  }

  // Build description text elements with gradient opacity
  const descriptionElements = descriptionLines
    .map((line, i) => {
      const y = descriptionY + i * descriptionLineHeight;
      // Opacity decreases for each line (1 -> 0.7 -> 0.4 -> 0.2)
      const opacity = Math.max(0.2, 1 - (i * 0.3));
      return `<text x="${padding}" y="${y}" font-size="${descriptionFontSize}" font-weight="400" fill="#a1a1aa" opacity="${opacity}">${escapeXml(line)}</text>`;
    })
    .join('\n');

  // Font style - uses system fonts configured via fontconfig
  const fontStyle = `text { font-family: ${FONT_FAMILY}; }`;

  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <style>${fontStyle}</style>
      <rect width="100%" height="100%" fill="#09090b"/>
      ${typeLabelElement}
      ${textElements}
      ${descriptionElements}
    </svg>
  `;

  try {
    // Generate base image from SVG
    let image = sharp(Buffer.from(svg));

    // Composite logo if available
    if (logoBuffer) {
      const logoHeight = 50;
      const logoWidth = Math.round(logoHeight * 2.07); // aspect ratio 688:333
      const resizedLogo = await sharp(logoBuffer)
        .resize(logoWidth, logoHeight)
        .png()
        .toBuffer();

      image = image.composite([{
        input: resizedLogo,
        top: height - 70 - logoHeight,
        left: width - padding - logoWidth,
      }]);
    }

    const pngBuffer = await image.png().toBuffer();

    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'public, max-age=172800, s-maxage=604800');
    res.send(pngBuffer);
  } catch (err) {
    console.error('OG image generation failed:', err);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

// Schema.org JSON-LD generators for AEO (Answer Engine Optimization)
function generateNewsArticleSchema(opts) {
  const { headline, description, datePublished, dateModified, targetUrl, ogImage } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    url: targetUrl,
    image: ogImage,
    publisher: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pollar.news/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': targetUrl
    },
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news'
    }
  };
}

function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Pollar News',
    url: 'https://pollar.news',
    description: 'AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.',
    logo: {
      '@type': 'ImageObject',
      url: 'https://pollar.news/logo.png'
    },
    sameAs: []
  };
}

// Breadcrumb segment name mapping
const BREADCRUMB_NAMES = {
  sejm: 'Sejm',
  dane: 'Dane',
  srodowisko: 'Środowisko',
  spoleczenstwo: 'Społeczeństwo',
  ekonomia: 'Ekonomia',
  transport: 'Transport',
  bezpieczenstwo: 'Bezpieczeństwo'
};

function generateBreadcrumbSchema(path, pageTitles) {
  const baseUrl = 'https://pollar.news';
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const items = [
    { '@type': 'ListItem', position: 1, name: 'Pollar', item: baseUrl }
  ];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];
    const pageInfo = pageTitles[currentPath];
    const name = pageInfo?.title || BREADCRUMB_NAMES[segments[i]] || segments[i];

    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: baseUrl + currentPath
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}

function generateSeoHtml(opts) {
  const { pageTitle, ogTitle, description, ogImage, targetUrl, ogType = 'article', schema = null, articlePublished = null, articleModified = null, articleSection = null, newsKeywords = null, pathWithoutLang = null, lang = 'pl' } = opts;

  // Generate JSON-LD script(s) if schema is provided (can be single object or array)
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const schemaScript = schemas
    .filter(Boolean)
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n    ');

  // Article meta tags (only for articles)
  const articleTags = ogType === 'article' ? [
    articlePublished ? `<meta property="article:published_time" content="${articlePublished}" />` : '',
    articleModified ? `<meta property="article:modified_time" content="${articleModified}" />` : '',
    articleSection ? `<meta property="article:section" content="${escapeHtml(articleSection)}" />` : '',
    newsKeywords ? `<meta name="news_keywords" content="${escapeHtml(newsKeywords)}" />` : '',
  ].filter(Boolean).join('\n    ') : '';

  // Generate hreflang tags for all supported languages
  const baseUrlForHreflang = 'https://pollar.news';
  const basePath = pathWithoutLang || '/';
  const hreflangTags = [
    `<link rel="alternate" hreflang="pl" href="${baseUrlForHreflang}${basePath === '/' ? '' : basePath}" />`,
    `<link rel="alternate" hreflang="en" href="${baseUrlForHreflang}/en${basePath === '/' ? '' : basePath}" />`,
    `<link rel="alternate" hreflang="de" href="${baseUrlForHreflang}/de${basePath === '/' ? '' : basePath}" />`,
    `<link rel="alternate" hreflang="x-default" href="${baseUrlForHreflang}${basePath === '/' ? '' : basePath}" />`
  ].join('\n    ');

  // og:locale for social sharing
  const ogLocaleMap = { pl: 'pl_PL', en: 'en_US', de: 'de_DE' };
  const ogLocale = ogLocaleMap[lang] || 'pl_PL';

  // All meta tags use self-closing /> for iMessage compatibility
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="Pollar" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${targetUrl}" />
    ${articleTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${targetUrl}" />
    <link rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" />
    ${hreflangTags}
    <link rel="alternate" type="application/rss+xml" title="Pollar News RSS" href="https://pollar.news/feed.xml" />
    ${schemaScript}
  </head>
  <body>
    <p>Przekierowywanie do <a href="${targetUrl}">${escapeHtml(ogTitle)}</a>...</p>
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
  </body>
</html>`;
}

// Fetch event data from API
async function fetchEventData(eventId, lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/events/${eventId}?lang=${lang}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Fetch brief data from API
async function fetchBriefData(lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/brief?lang=${lang}`);
    if (!response.ok) return null;
    const result = await response.json();
    return result.data;
  } catch {
    return null;
  }
}

// Fetch felieton data from API
async function fetchFelietonData(felietonId, lang = 'pl') {
  try {
    const response = await fetch(`${API_BASE}/api/felietony/${felietonId}?lang=${lang}`);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

// Trust proxy for correct protocol detection behind Railway/load balancer
app.set('trust proxy', true);

// Security headers with helmet
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "blob:",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://cloud.umami.is",
        "https://www.googletagmanager.com",
        "https://www.google-analytics.com",
        "https://apis.google.com",
        "https://static.ads-twitter.com",
        "https://t.contentsquare.net",
      ],
      styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com"],
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https://pollar.up.railway.app",
        "https://*.mapbox.com",
        "https://firebasestorage.googleapis.com",
        "https://storage.googleapis.com",
        "https://lh3.googleusercontent.com",
        "https://*.google.com",
        "https://*.google.pl",
        "https://*.gstatic.com",
        "https://*.doubleclick.net",
        "https://t.co",
        "https://analytics.twitter.com",
        "https://t.contentsquare.net",
        "https://upload.wikimedia.org",
      ],
      fontSrc: ["'self'", "data:"],
      connectSrc: [
        "'self'",
        "https://pollar.up.railway.app",
        "https://pollar-backend-production.up.railway.app",
        "https://en.wikipedia.org",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://*.tiles.mapbox.com",
        "https://api.sejm.gov.pl",
        "https://*.firebaseio.com",
        "https://*.googleapis.com",
        "https://firebaseinstallations.googleapis.com",
        "https://identitytoolkit.googleapis.com",
        "https://securetoken.googleapis.com",
        "https://cloud.umami.is",
        "https://api-gateway.umami.dev",
        "https://www.google-analytics.com",
        "https://*.google-analytics.com",
        "https://*.analytics.google.com",
        "https://www.googletagmanager.com",
        "https://stats.g.doubleclick.net",
        "https://*.sentry.io",
        "https://static.ads-twitter.com",
        "https://analytics.twitter.com",
        "https://t.co",
        "https://t.contentsquare.net",
        "wss://*.firebaseio.com",
      ],
      frameSrc: [
        "'self'",
        "https://*.firebaseapp.com",
        "https://accounts.google.com",
        "https://appleid.apple.com",
      ],
      workerSrc: ["'self'", "blob:"],
      childSrc: ["'self'", "blob:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'", "https://storage.googleapis.com", "https://firebasestorage.googleapis.com"],
      formAction: ["'self'"],
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: { policy: 'same-origin-allow-popups' },
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
}));

// Redirect pollar.pl to pollar.news (canonical domain)
app.use((req, res, next) => {
  const host = req.get('host');
  if (host && host.includes('pollar.pl')) {
    return res.redirect(301, `https://pollar.news${req.originalUrl}`);
  }
  next();
});

// Supported languages for i18n URL routing
const SUPPORTED_LANGS = ['en', 'de'];

// Redirect /pl/... to /... (Polish is default without prefix)
app.use((req, res, next) => {
  if (req.path.startsWith('/pl/') || req.path === '/pl') {
    const newPath = req.path.replace(/^\/pl/, '') || '/';
    return res.redirect(301, `https://pollar.news${newPath}`);
  }
  next();
});

// Language detection middleware - extracts lang from URL and sets req.lang
app.use((req, res, next) => {
  const langMatch = req.path.match(/^\/(en|de)(\/|$)/);
  if (langMatch) {
    req.lang = langMatch[1];
    req.pathWithoutLang = req.path.replace(/^\/(en|de)/, '') || '/';
  } else {
    req.lang = 'pl';
    req.pathWithoutLang = req.path;
  }
  next();
});

// Enable gzip compression for all responses
app.use(compression());

// CC license HTTP Link header (CC REL discovery for crawlers and CC Search/Openverse)
app.use((req, res, next) => {
  res.set('Link', '<https://creativecommons.org/licenses/by-nc-sa/4.0/>; rel="license"');
  next();
});

// robots.txt endpoint
app.get('/robots.txt', (req, res) => {
  const robots = `# Pollar News (pollar.news)
# All original articles and summaries are licensed under
# Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)
# https://creativecommons.org/licenses/by-nc-sa/4.0/
#
# You are free to:
#   Share - copy and redistribute the material in any medium or format
#   Adapt - remix, transform, and build upon the material
#
# Under the following terms:
#   Attribution - You must give appropriate credit to Pollar News (pollar.news)
#   NonCommercial - You may not use the material for commercial purposes
#   ShareAlike - If you remix or transform, you must distribute under the same license
#
# (c) Pollar News (pollar.news)

# AI crawlers — welcome
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: Applebot
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Googlebot
Allow: /

User-agent: bingbot
Allow: /

# All other crawlers
User-agent: *
Allow: /

Sitemap: https://pollar.news/sitemap.xml
LLMsTxt: https://pollar.news/llms.txt
`;
  res.set('Content-Type', 'text/plain');
  res.set('Cache-Control', 'public, max-age=86400'); // Cache for 1 day
  res.send(robots);
});

// llms.txt endpoint — machine-readable site description for LLMs (AEO)
app.get('/llms.txt', (req, res) => {
  const llms = `# Pollar News

> Polish AI-powered news aggregator and public data platform. Pollar organizes, summarizes, and contextualizes daily events using AI — no clickbait, only verified facts. All original content is licensed under CC BY-NC-SA 4.0.

Pollar News is operated by Pollar P.S.A., a company registered in Kraków, Poland (KRS 0001194489).

## What Pollar Does

- Aggregates and summarizes news articles from Polish and international press using AI
- Publishes a Daily Brief — a concise AI-generated summary of the day's most important events
- Publishes opinion pieces (felietony) with analysis and commentary
- Provides open data dashboards: Sejm (parliament), stock market (GPW), air quality, real estate prices, energy mix, crime statistics, and more
- Tracks Polish parliamentary activity: votes, MPs, committees, legislative processes
- Available in Polish, English, and German

## Sections

- [Home](https://pollar.news/): Latest aggregated news events
- [Daily Brief](https://pollar.news/brief): AI-generated daily news summary
- [Event Map](https://pollar.news/mapa): Interactive map of current events in Poland
- [Connections Game](https://pollar.news/powiazania): Daily word puzzle (NYT Connections-style)
- [Event Graph](https://pollar.news/graf): Network graph showing relationships between events
- [Stock Market](https://pollar.news/gielda): Live WIG20, mWIG40 quotes from GPW
- [News Sources](https://pollar.news/sources): All tracked sources with political orientation and ownership classification

## Parliament (Sejm)

- [Sejm Overview](https://pollar.news/sejm): Statistics, polls, live sessions, MP rankings
- [MPs](https://pollar.news/sejm/poslowie): Full list of 460 MPs with voting history
- [Clubs](https://pollar.news/sejm/kluby): Parliamentary clubs and caucuses
- [Votes](https://pollar.news/sejm/glosowania): Archive of all parliamentary votes
- [Committees](https://pollar.news/sejm/komisje): Standing and special committees
- [Sessions](https://pollar.news/sejm/posiedzenia): Session calendar and agendas
- [Bills](https://pollar.news/sejm/druki): Legislative documents
- [Legislative Processes](https://pollar.news/sejm/procesy): Bill tracking from submission to presidential signature
- [Interpellations](https://pollar.news/sejm/interpelacje): MP questions to government ministers
- [Live Streams](https://pollar.news/sejm/transmisje): Video streams from Sejm sessions

## Open Data

- [Air Quality](https://pollar.news/dane/srodowisko/powietrze): Live PM2.5/PM10 data from GIOŚ stations
- [Names](https://pollar.news/dane/spoleczenstwo/imiona): Most popular given names in Poland (GUS)
- [Surnames](https://pollar.news/dane/spoleczenstwo/nazwiska): Surname statistics and geographic distribution
- [Energy](https://pollar.news/dane/ekonomia/energia): Poland's energy mix and electricity prices
- [Eurostat](https://pollar.news/dane/ekonomia/eurostat): GDP, inflation, unemployment vs. EU
- [Real Estate](https://pollar.news/dane/ekonomia/mieszkania): Average housing prices per m² in major cities
- [Railways](https://pollar.news/dane/transport/kolej): Passenger and freight transport statistics
- [Ports](https://pollar.news/dane/transport/porty): Cargo throughput at Polish seaports
- [Crime](https://pollar.news/dane/bezpieczenstwo/przestepczosc): Police crime and detection statistics

## Legal & Licensing

- [Terms of Service](https://pollar.news/regulamin): Section 7 contains the full CC BY-NC-SA 4.0 license terms
- [Privacy Policy](https://pollar.news/polityka-prywatnosci)
- [Contact](https://pollar.news/kontakt)

All original articles, summaries, daily briefs, and opinion pieces published by Pollar News are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/). Attribution: **Pollar News (pollar.news)**.

This license does not cover graphics, logos, software, or content originating from third-party press sources.

## Feeds

- [RSS Feed (PL)](https://pollar.news/feed.xml)
- [RSS Feed (EN)](https://pollar.news/en/feed.xml)
- [RSS Feed (DE)](https://pollar.news/de/feed.xml)
- [Sitemap](https://pollar.news/sitemap.xml)
- [llms-full.txt](https://pollar.news/llms-full.txt): Extended version with latest articles and full site content
`;
  res.set('Content-Type', 'text/markdown; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=86400');
  res.send(llms);
});

// llms-full.txt — extended version with dynamic content for LLMs with large context windows
app.get('/llms-full.txt', async (req, res) => {
  const lang = req.lang || 'pl';

  // Fetch latest brief
  let briefSection = '';
  try {
    const brief = await fetchBriefData(lang);
    if (brief) {
      const date = brief.date ? new Date(brief.date).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
      briefSection = `## Latest Daily Brief${date ? ` — ${date}` : ''}

**${brief.headline || 'Daily Brief'}**

${brief.executiveSummary ? `### Executive Summary\n\n${stripHtml(brief.executiveSummary)}\n` : ''}
${(brief.sections || []).map((s, i) => `### ${i + 1}. ${s.title}\n\n${stripHtml(s.content || s.summary || '')}`).join('\n\n')}

${brief.insights?.length ? `### Key Insights\n\n${brief.insights.map(ins => `- ${stripHtml(ins)}`).join('\n')}` : ''}
`;
    }
  } catch { /* skip if unavailable */ }

  // Fetch recent events
  let eventsSection = '';
  try {
    const response = await fetch(`${API_BASE}/api/events?lang=${lang}&limit=20`);
    if (response.ok) {
      const data = await response.json();
      const events = Array.isArray(data) ? data : (data.data || data.events || []);
      if (events.length > 0) {
        eventsSection = `## Recent Events\n\n` + events.map(e => {
          const title = stripHtml(e.title || '');
          const summary = stripHtml(e.lead || e.summary || '');
          const kps = (e.metadata?.keyPoints || []).map(kp => `  - **${stripHtml(kp.title || '')}**: ${stripHtml(kp.description || '')}`).join('\n');
          const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
          const category = e.category || e.metadata?.category || '';
          return `### ${title}\n\n${date}${category ? ` · ${category}` : ''}\n\n${summary}\n${kps ? `\n**Key points:**\n${kps}` : ''}\n\nSource: https://pollar.news/event/${e.id}`;
        }).join('\n\n---\n\n') + '\n';
      }
    }
  } catch { /* skip if unavailable */ }

  // Fetch recent felietony
  let felietonySection = '';
  try {
    const response = await fetch(`${API_BASE}/api/felietony?lang=${lang}&limit=5`);
    if (response.ok) {
      const data = await response.json();
      const felietony = Array.isArray(data) ? data : (data.data || data.felietony || []);
      if (felietony.length > 0) {
        felietonySection = `## Recent Opinion Pieces (Felietony)\n\n` + felietony.map(f => {
          const title = stripHtml(f.title || '');
          const lead = stripHtml(f.lead || '');
          return `### ${title}\n\n${lead}\n\nSource: https://pollar.news/felieton/${f.id}`;
        }).join('\n\n---\n\n') + '\n';
      }
    }
  } catch { /* skip if unavailable */ }

  const llmsFull = `# Pollar News — Full Content

> Polish AI-powered news aggregator and public data platform. All original content is licensed under CC BY-NC-SA 4.0.
> Attribution: Pollar News (pollar.news)

Pollar News is operated by Pollar P.S.A., a company registered in Kraków, Poland (KRS 0001194489, NIP: 6772540681).
Website: https://pollar.news | Contact: https://pollar.news/kontakt

---

## About Pollar News

Pollar News is an AI-powered news platform that aggregates, summarizes, and contextualizes daily events from Polish and international press. The platform uses artificial intelligence to organize headlines and generate concise summaries — no clickbait, only verified facts.

### Core Features
- **News Aggregation**: Collects articles from dozens of Polish and international sources, grouped by event
- **AI Summaries**: Each event gets an AI-generated summary with key points
- **Daily Brief**: A comprehensive AI-generated daily news summary with executive summary, thematic sections, and key insights
- **Opinion Pieces (Felietony)**: AI-generated analysis and commentary on economics, geopolitics, and Polish politics
- **Parliament Tracker**: Full coverage of the Polish Sejm — MPs, votes, committees, legislative processes, live sessions
- **Open Data Dashboards**: Visualizations of air quality (GIOŚ), energy mix, real estate prices, Eurostat indicators, crime statistics, railway/port data
- **Stock Market**: Live WIG20/mWIG40 quotes from GPW (Warsaw Stock Exchange)
- **Event Map**: Interactive map of current events across Poland
- **Event Graph**: Network graph showing relationships between events
- **Connections Game**: Daily word puzzle inspired by NYT Connections
- **Multilingual**: Available in Polish, English, and German

---

${briefSection}
${eventsSection}
${felietonySection}

---

## License

All original articles, summaries, daily briefs, and opinion pieces published by Pollar News are licensed under [Creative Commons Attribution-NonCommercial-ShareAlike 4.0 International (CC BY-NC-SA 4.0)](https://creativecommons.org/licenses/by-nc-sa/4.0/).

**You are free to:**
- Share — copy and redistribute the material in any medium or format
- Adapt — remix, transform, and build upon the material

**Under the following terms:**
- **Attribution** — you must credit "Pollar News (pollar.news)", provide a link to the license, and indicate if changes were made
- **NonCommercial** — you may not use the material for commercial purposes (activities primarily directed towards commercial advantage or monetary compensation)
- **ShareAlike** — if you remix, transform, or build upon the material, you must distribute under the same CC BY-NC-SA 4.0 license

This license does not cover the website's graphics, logos, software, or content originating from third-party press sources. Any restrictions expressed via this license constitute express reservations of rights under Article 4 of Directive (EU) 2019/790 on copyright in the Digital Single Market.

Full legal code: https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode

---

## Feeds & Machine-Readable Resources

- RSS (PL): https://pollar.news/feed.xml
- RSS (EN): https://pollar.news/en/feed.xml
- RSS (DE): https://pollar.news/de/feed.xml
- Sitemap: https://pollar.news/sitemap.xml
- LLMs.txt: https://pollar.news/llms.txt
- Terms of Service: https://pollar.news/regulamin
- Privacy Policy: https://pollar.news/polityka-prywatnosci
`;

  res.set('Content-Type', 'text/markdown; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour — dynamic content
  res.send(llmsFull);
});

// Sitemap.xml endpoint with dynamic events and multilingual support
app.get('/sitemap.xml', async (req, res) => {
  const baseUrl = 'https://pollar.news';
  const LANGUAGES = ['pl', 'en', 'de'];

  // Helper to generate xhtml:link tags for all language versions
  const generateHreflangLinks = (path) => {
    const plUrl = `${baseUrl}${path}`;
    const enUrl = `${baseUrl}/en${path}`;
    const deUrl = `${baseUrl}/de${path}`;
    return `
      <xhtml:link rel="alternate" hreflang="pl" href="${plUrl}"/>
      <xhtml:link rel="alternate" hreflang="en" href="${enUrl}"/>
      <xhtml:link rel="alternate" hreflang="de" href="${deUrl}"/>
      <xhtml:link rel="alternate" hreflang="x-default" href="${plUrl}"/>`;
  };

  // Helper to generate a complete URL entry with hreflang
  const generateUrlEntry = (path) => {
    const loc = `${baseUrl}${path}`;
    return `  <url>
    <loc>${loc}</loc>${generateHreflangLinks(path)}
  </url>`;
  };

  // Static pages from PAGE_TITLES
  const staticPages = Object.keys(PAGE_TITLES).filter(path => path !== '/brief');

  // Add /brief separately
  staticPages.push('/brief');

  // Fetch events from API
  let events = [];
  try {
    const response = await fetch(`${API_BASE}/api/events?lang=pl&limit=1000`);
    if (response.ok) {
      const data = await response.json();
      // API returns { data: [...] } or { events: [...] } or direct array
      events = Array.isArray(data) ? data : (data.data || data.events || []);
    }
  } catch (err) {
    console.warn('Could not fetch events for sitemap:', err.message);
  }

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
    ...events.map(e => generateUrlEntry(`/event/${e.id}`)),
    ...felietony.map(f => generateUrlEntry(`/felieton/${f.id}`))
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

// RSS Feed descriptions per language
const RSS_DESCRIPTIONS = {
  pl: 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia.',
  en: 'All the most important news in one place. AI organizes and summarizes today\'s events.',
  de: 'Alle wichtigen Nachrichten an einem Ort. KI organisiert und fasst die Ereignisse des Tages zusammen.'
};

// RSS Feed endpoint (supports /feed.xml, /en/feed.xml, /de/feed.xml)
app.get(['/:lang(en|de)/feed.xml', '/feed.xml'], async (req, res) => {
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
    const link = `${baseUrl}${langPrefix}/event/${e.id}`;
    const pubDate = e.createdAt ? new Date(e.createdAt).toUTCString() : now;
    const guid = `${baseUrl}/event/${e.id}`; // guid stays canonical (without lang prefix)

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

// Crawler middleware
app.use(async (req, res, next) => {
  if (!isCrawler(req.headers['user-agent'])) {
    return next();
  }

  // Always use HTTPS in production
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}`;
  const lang = req.lang || 'pl';
  const pathWithoutLang = req.pathWithoutLang || req.path;
  const targetUrl = `${baseUrl}${req.path}`; // Keep full path with lang prefix for canonical

  // Event page
  const eventMatch = pathWithoutLang.match(/^\/event\/([^/?#]+)/);
  if (eventMatch) {
    const event = await fetchEventData(eventMatch[1], lang);
    if (event) {
      const shortTitle = event.metadata?.ultraShortHeadline || event.title || 'Pollar';
      const ogTitle = `Pollar News: ${shortTitle}`;
      const fullTitle = event.title || 'Pollar';
      const kp = event.metadata?.keyPoints?.[0];
      const description = truncate(stripHtml(kp?.description || event.lead || event.summary || ''), 160);
      // For OG image, use longer description (up to 300 chars for multi-line display)
      const ogImageDescription = truncate(stripHtml(event.lead || kp?.description || event.summary || ''), 300);
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(fullTitle)}&type=event&description=${encodeURIComponent(ogImageDescription)}&lang=${lang}`;

      // Generate NewsArticle schema for AEO
      const schema = generateNewsArticleSchema({
        headline: fullTitle,
        description,
        datePublished: event.createdAt || event.date,
        dateModified: event.updatedAt || event.createdAt || event.date,
        targetUrl,
        ogImage
      });

      // Build news_keywords from event metadata
      const keywordParts = [
        event.metadata?.category,
        ...(event.metadata?.mentionedPeople?.map(p => p.name) || []),
        ...(event.metadata?.mentionedCountries || []),
        event.metadata?.location?.city
      ].filter(Boolean);
      const newsKeywords = keywordParts.length > 0 ? keywordParts.join(', ') : null;

      return res.send(generateSeoHtml({
        pageTitle: `${shortTitle} | Pollar`,
        ogTitle,
        description,
        ogImage,
        targetUrl,
        schema,
        articlePublished: event.createdAt || event.date,
        articleModified: event.updatedAt || event.createdAt || event.date,
        articleSection: event.metadata?.category,
        newsKeywords,
        pathWithoutLang,
        lang
      }));
    }
  }

  // Brief page
  if (pathWithoutLang === '/brief') {
    const brief = await fetchBriefData(lang);
    let briefTitle = 'Daily Brief';
    let description = 'Podsumowanie najważniejszych wydarzeń dnia.';
    let imageTitle = briefTitle;
    let ogImageDescription = description;

    if (brief) {
      const date = brief.date ? new Date(brief.date).toLocaleDateString('pl-PL', {
        day: 'numeric', month: 'long', year: 'numeric'
      }) : '';
      briefTitle = date ? `Daily Brief – ${date}` : 'Daily Brief';
      imageTitle = brief.headline || briefTitle;
      description = truncate(stripHtml(brief.lead || brief.executiveSummary || ''), 160);
      ogImageDescription = truncate(stripHtml(brief.lead || brief.executiveSummary || ''), 300);
    }

    const ogTitle = `Pollar News: ${briefTitle}`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(imageTitle)}&type=brief&description=${encodeURIComponent(ogImageDescription)}&lang=${lang}`;

    // Generate NewsArticle schema for AEO
    const schema = generateNewsArticleSchema({
      headline: imageTitle,
      description,
      datePublished: brief?.date,
      targetUrl,
      ogImage
    });

    return res.send(generateSeoHtml({
      pageTitle: `${briefTitle} | Pollar`,
      ogTitle,
      description,
      ogImage,
      targetUrl,
      schema,
      articlePublished: brief?.date || brief?.generatedAt,
      articleSection: 'Daily Brief',
      pathWithoutLang,
      lang
    }));
  }

  // Felieton page
  const felietonMatch = pathWithoutLang.match(/^\/felieton\/([^/?#]+)/);
  if (felietonMatch) {
    const felieton = await fetchFelietonData(felietonMatch[1], lang);
    let felietonTitle = 'Felieton';
    let description = 'Felieton Pollar News.';
    let ogImageDescription = description;

    if (felieton) {
      felietonTitle = felieton.title || felietonTitle;
      description = truncate(stripHtml(felieton.lead || ''), 160);
      ogImageDescription = truncate(stripHtml(felieton.lead || ''), 300);
    }

    const ogTitle = `Pollar News: ${felietonTitle}`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(felietonTitle)}&type=felieton&description=${encodeURIComponent(ogImageDescription)}&lang=${lang}`;

    // Generate NewsArticle schema for AEO
    const schema = generateNewsArticleSchema({
      headline: felietonTitle,
      description,
      datePublished: felieton?.createdAt || felieton?.date,
      targetUrl,
      ogImage
    });

    return res.send(generateSeoHtml({
      pageTitle: `${felietonTitle} | Pollar`,
      ogTitle,
      description,
      ogImage,
      targetUrl,
      schema,
      articlePublished: felieton?.createdAt || felieton?.date,
      articleSection: felieton?.category || 'Felieton',
      pathWithoutLang,
      lang
    }));
  }

  // Static pages from PAGE_TITLES map
  const pageInfo = PAGE_TITLES[pathWithoutLang];
  if (pageInfo) {
    const isHomepage = pathWithoutLang === '/';
    const ogTitle = isHomepage ? pageInfo.title : `Pollar News: ${pageInfo.title}`;
    const pageTitle = isHomepage ? 'Pollar — Wiesz więcej' : `${pageInfo.title} | Pollar`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(pageInfo.title)}&description=${encodeURIComponent(pageInfo.description)}&lang=${lang}`;

    // Use Organization schema for homepage, WebPage + BreadcrumbList for other static pages
    let schema;
    if (isHomepage) {
      schema = generateOrganizationSchema();
    } else {
      const webPageSchema = { '@context': 'https://schema.org', '@type': 'WebPage', name: pageInfo.title, description: pageInfo.description, url: targetUrl };
      const breadcrumbSchema = generateBreadcrumbSchema(pathWithoutLang, PAGE_TITLES);
      schema = breadcrumbSchema ? [webPageSchema, breadcrumbSchema] : webPageSchema;
    }

    return res.send(generateSeoHtml({
      pageTitle,
      ogTitle,
      description: pageInfo.description,
      ogImage,
      targetUrl: isHomepage ? baseUrl : targetUrl,
      ogType: 'website',
      schema,
      pathWithoutLang,
      lang
    }));
  }

  next();
});

// Serve hashed assets with long-term caching (1 year, immutable)
app.use('/assets', express.static(join(__dirname, 'dist/assets'), {
  maxAge: '1y',
  immutable: true
}));

// Serve other static files with short cache
app.use(express.static(join(__dirname, 'dist'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // No cache for HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

// Sentry error handler (must be before other error handlers)
if (process.env.SENTRY_DSN) {
  Sentry.setupExpressErrorHandler(app);
}

// Generic error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
