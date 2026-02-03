import express from 'express';
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
  '/powiazania': { title: 'Powiązania', description: 'Codzienna gra słowna w stylu NYT Connections. Znajdź ukryte powiązania!' },
  '/mapa': { title: 'Mapa wydarzeń', description: 'Interaktywna mapa najważniejszych wydarzeń.' },
  '/terminal': { title: 'Terminal', description: 'Terminal informacyjny Pollar News.' },
  '/polityka-prywatnosci': { title: 'Polityka prywatności', description: 'Polityka prywatności serwisu Pollar News.' },
  // Sejm
  '/sejm': { title: 'Sejm', description: 'Dane i statystyki z Sejmu RP.' },
  '/sejm/poslowie': { title: 'Posłowie', description: 'Lista posłów Sejmu RP X kadencji.' },
  '/sejm/kluby': { title: 'Kluby parlamentarne', description: 'Kluby i koła poselskie w Sejmie RP.' },
  '/sejm/glosowania': { title: 'Głosowania', description: 'Historia głosowań w Sejmie RP.' },
  '/sejm/komisje': { title: 'Komisje sejmowe', description: 'Komisje stałe i nadzwyczajne Sejmu RP.' },
  '/sejm/posiedzenia': { title: 'Posiedzenia', description: 'Posiedzenia Sejmu RP.' },
  '/sejm/druki': { title: 'Druki sejmowe', description: 'Projekty ustaw i druki sejmowe.' },
  '/sejm/procesy': { title: 'Procesy legislacyjne', description: 'Śledzenie procesów legislacyjnych w Sejmie.' },
  '/sejm/interpelacje': { title: 'Interpelacje', description: 'Interpelacje poselskie.' },
  '/sejm/zapytania': { title: 'Zapytania', description: 'Zapytania poselskie.' },
  '/sejm/transmisje': { title: 'Transmisje', description: 'Transmisje z posiedzeń Sejmu.' },
  // Dane
  '/dane': { title: 'Dane', description: 'Wizualizacje danych i statystyk.' },
  '/dane/srodowisko/powietrze': { title: 'Jakość powietrza', description: 'Aktualne dane o jakości powietrza w Polsce.' },
  '/dane/spoleczenstwo/imiona': { title: 'Imiona', description: 'Statystyki najpopularniejszych imion w Polsce.' },
  '/dane/spoleczenstwo/nazwiska': { title: 'Nazwiska', description: 'Statystyki najpopularniejszych nazwisk w Polsce.' },
  '/dane/ekonomia/energia': { title: 'Energia', description: 'Dane o produkcji i zużyciu energii.' },
  '/dane/ekonomia/eurostat': { title: 'Eurostat', description: 'Dane statystyczne z Eurostatu.' },
  '/dane/ekonomia/mieszkania': { title: 'Ceny mieszkań', description: 'Aktualne ceny mieszkań w Polsce.' },
  '/dane/transport/kolej': { title: 'Kolej', description: 'Statystyki transportu kolejowego.' },
  '/dane/transport/porty': { title: 'Porty', description: 'Statystyki portów morskich.' },
  '/dane/bezpieczenstwo/przestepczosc': { title: 'Przestępczość', description: 'Statystyki przestępczości w Polsce.' },
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
  const { title = 'Pollar News', type = 'default', description = '' } = req.query;

  const typeLabels = {
    event: 'WYDARZENIE',
    brief: 'DAILY BRIEF',
    felieton: 'FELIETON',
    default: '',
  };
  const typeLabel = typeLabels[type] || '';

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
  const descriptionY = textY + displayLines.length * lineHeight + 40;
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

function generateSeoHtml(opts) {
  const { pageTitle, ogTitle, description, ogImage, targetUrl, ogType = 'article' } = opts;
  // All meta tags use self-closing /> for iMessage compatibility
  return `<!DOCTYPE html>
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
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:url" content="${targetUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${targetUrl}" />
  </head>
  <body>
    <p>Przekierowywanie do <a href="${targetUrl}">${escapeHtml(ogTitle)}</a>...</p>
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
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
    return await response.json();
  } catch {
    return null;
  }
}

// Trust proxy for correct protocol detection behind Railway/load balancer
app.set('trust proxy', true);

// Crawler middleware
app.use(async (req, res, next) => {
  if (!isCrawler(req.headers['user-agent'])) {
    return next();
  }

  // Always use HTTPS in production
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}`;
  const targetUrl = `${baseUrl}${req.path}`;

  // Event page
  const eventMatch = req.path.match(/^\/event\/([^/?#]+)/);
  if (eventMatch) {
    const event = await fetchEventData(eventMatch[1]);
    if (event) {
      const shortTitle = event.metadata?.ultraShortHeadline || event.title || 'Pollar';
      const ogTitle = `Pollar News: ${shortTitle}`;
      const fullTitle = event.title || 'Pollar';
      const kp = event.metadata?.keyPoints?.[0];
      const description = truncate(stripHtml(kp?.description || event.lead || event.summary || ''), 160);
      // For OG image, use longer description (up to 300 chars for multi-line display)
      const ogImageDescription = truncate(stripHtml(event.lead || event.summary || kp?.description || ''), 300);
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(fullTitle)}&type=event&description=${encodeURIComponent(ogImageDescription)}`;

      return res.send(generateSeoHtml({
        pageTitle: `${shortTitle} | Pollar`,
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
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(imageTitle)}&type=brief&description=${encodeURIComponent(ogImageDescription)}`;
    return res.send(generateSeoHtml({
      pageTitle: `${briefTitle} | Pollar`,
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
    let felietonTitle = 'Felieton';
    let description = 'Felieton Pollar News.';
    let ogImageDescription = description;

    if (felieton) {
      felietonTitle = felieton.title || felietonTitle;
      description = truncate(stripHtml(felieton.lead || ''), 160);
      ogImageDescription = truncate(stripHtml(felieton.lead || ''), 300);
    }

    const ogTitle = `Pollar News: ${felietonTitle}`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(felietonTitle)}&type=felieton&description=${encodeURIComponent(ogImageDescription)}`;
    return res.send(generateSeoHtml({
      pageTitle: `${felietonTitle} | Pollar`,
      ogTitle,
      description,
      ogImage,
      targetUrl
    }));
  }

  // Static pages from PAGE_TITLES map
  const pageInfo = PAGE_TITLES[req.path];
  if (pageInfo) {
    const isHomepage = req.path === '/';
    const ogTitle = isHomepage ? pageInfo.title : `Pollar News: ${pageInfo.title}`;
    const pageTitle = isHomepage ? 'Pollar — Wiesz więcej' : `${pageInfo.title} | Pollar`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(pageInfo.title)}&description=${encodeURIComponent(pageInfo.description)}`;

    return res.send(generateSeoHtml({
      pageTitle,
      ogTitle,
      description: pageInfo.description,
      ogImage,
      targetUrl: isHomepage ? baseUrl : targetUrl,
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
