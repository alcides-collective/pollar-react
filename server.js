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
import { join } from 'path';
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

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(join(PROJECT_ROOT, 'dist', 'index.html'));
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
