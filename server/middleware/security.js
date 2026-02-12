import helmet from 'helmet';
import compression from 'compression';

export function setupSecurity(app) {
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
          "blob:",
          "https://api.mapbox.com",
          "https://events.mapbox.com",
          "https://cloud.umami.is",
          "https://www.googletagmanager.com",
          "https://www.google-analytics.com",
          "https://apis.google.com",
          "https://static.ads-twitter.com",
          "https://t.contentsquare.net",
          "https://*.contentsquare.net",
        ],
        styleSrc: ["'self'", "'unsafe-inline'", "https://api.mapbox.com", "https://fonts.googleapis.com"],
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
          "https://*.contentsquare.net",
          "https://upload.wikimedia.org",
        ],
        fontSrc: ["'self'", "data:", "https://fonts.gstatic.com"],
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
          "https://fonts.gstatic.com",
          "https://firebaseinstallations.googleapis.com",
          "https://identitytoolkit.googleapis.com",
          "https://securetoken.googleapis.com",
          "https://cloud.umami.is",
          "https://api-gateway.umami.dev",
          "https://www.google-analytics.com",
          "https://*.google-analytics.com",
          "https://analytics.google.com",
          "https://*.analytics.google.com",
          "https://www.google.com",
          "https://www.googletagmanager.com",
          "https://stats.g.doubleclick.net",
          "https://*.doubleclick.net",
          "https://pagead2.googlesyndication.com",
          "https://*.googlesyndication.com",
          "https://*.sentry.io",
          "https://static.ads-twitter.com",
          "https://analytics.twitter.com",
          "https://t.co",
          "https://t.contentsquare.net",
          "https://*.contentsquare.net",
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
}
