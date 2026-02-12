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
import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import { PORT, PROJECT_ROOT } from './server/config.js';
import { crawlerStats } from './server/utils/crawler.js';
import { setupSecurity } from './server/middleware/security.js';
import { crawlerSsrMiddleware, crawler404Handler } from './server/middleware/crawlerSsr.js';
import { ogRoutes } from './server/routes/og.js';
import { staticRoutes } from './server/routes/static.js';
import { llmsFullRoutes } from './server/routes/llmsFull.js';
import { feedRoutes } from './server/routes/feeds.js';
import { crawlerStatsRoutes } from './server/routes/crawlerStats.js';

const app = express();

// Read index.html template once at startup for nonce injection
const indexHtmlPath = resolve(PROJECT_ROOT, 'dist', 'index.html');
const indexHtmlTemplate = readFileSync(indexHtmlPath, 'utf-8');

// Security, redirects, language detection, compression
setupSecurity(app);

// API & static content routes
app.use(ogRoutes);
app.use(staticRoutes);
app.use(llmsFullRoutes);
app.use(feedRoutes);
app.use(crawlerStatsRoutes);

// Crawler SSR middleware (serves pre-rendered HTML for bots)
app.use(crawlerSsrMiddleware);

// Serve hashed assets with long-term caching (1 year, immutable)
app.use('/assets', express.static(join(PROJECT_ROOT, 'dist/assets'), {
  maxAge: '1y',
  immutable: true
}));

// Serve other static files with short cache (skip files handled by dynamic endpoints)
app.use((req, res, next) => {
  if (req.path === '/robots.txt' || req.path === '/llms.txt' || req.path === '/llms-full.txt' || req.path === '/ai.txt') return next('route');
  next();
}, express.static(join(PROJECT_ROOT, 'dist'), {
  maxAge: '1h',
  setHeaders: (res, filePath) => {
    // No cache for HTML files
    if (filePath.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache');
    }
  }
}));

// Crawler-specific 404 handler
app.use(crawler404Handler);

// SPA fallback — inject CSP nonce into inline scripts
app.get('*', (req, res) => {
  const nonce = res.locals.cspNonce;
  // Add nonce to bare <script> tags (inline only, not <script src=...> or <script type="module">)
  const html = indexHtmlTemplate.replace(/<script>(?=\s*[^<])/g, `<script nonce="${nonce}">`);
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Cache-Control', 'no-cache');
  res.send(html);
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

app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);

  // Purge Cloudflare cache on deploy so crawlers get fresh robots.txt, OG images, etc.
  const cfZone = process.env.CLOUDFLARE_ZONE_ID || 'a04a6a3ed2fbe2e830e8025e8b972c4c';
  const cfToken = process.env.CLOUDFLARE_API_TOKEN;
  if (cfToken) {
    try {
      const resp = await fetch(`https://api.cloudflare.com/client/v4/zones/${cfZone}/purge_cache`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${cfToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ purge_everything: true }),
      });
      const data = await resp.json();
      console.log(`[Cloudflare] Cache purge: ${data.success ? 'OK' : 'FAILED'}`, data.success ? '' : data.errors);
    } catch (err) {
      console.warn('[Cloudflare] Cache purge failed:', err.message);
    }
  } else {
    console.log('[Cloudflare] No CLOUDFLARE_API_TOKEN set, skipping cache purge');
  }

  // Log crawler stats summary every hour
  setInterval(() => {
    if (crawlerStats.total === 0) return;
    const topBots = Object.entries(crawlerStats.bots)
      .sort(([, a], [, b]) => b.count - a.count)
      .slice(0, 10)
      .map(([name, d]) => `${name}: ${d.count}`)
      .join(', ');
    console.log(`[CrawlerStats] Total: ${crawlerStats.total} | ${topBots}`);
  }, 3600000); // every hour
});
