// Crawler detection
// Note: iMessage spoofs facebookexternalhit + Twitterbot, so it's already covered
export const CRAWLER_USER_AGENTS = [
  // Social media & messengers
  'facebookexternalhit', 'Facebot', 'Twitterbot', 'LinkedInBot', 'WhatsApp',
  'Slackbot', 'TelegramBot', 'Discordbot', 'Embedly', 'Pinterest', 'Skype', 'vkShare',
  'redditbot',
  // Search engines
  'Googlebot', 'Google-Extended', 'bingbot', 'Applebot', 'PetalBot', 'Sogou',
  'YandexBot', 'Mediapartners-Google', 'DuckDuckBot', 'Baiduspider',
  // AI assistants & LLM crawlers (use Mozilla-based UAs)
  'ClaudeBot', 'Claude-Web', 'Anthropic', 'ChatGPT-User', 'GPTBot', 'OAI-SearchBot',
  'PerplexityBot', 'cohere-ai', 'YouBot', 'Google-SafetyBot',
  'CCBot', 'Bytespider', 'Diffbot', 'ImagesiftBot', 'Omgilibot'
];

export function isCrawler(userAgent) {
  if (!userAgent) return false;
  const ua = userAgent.toLowerCase();
  // Known bots get SSR
  if (CRAWLER_USER_AGENTS.some(bot => ua.includes(bot.toLowerCase()))) return true;
  // Non-browser clients (curl, wget, httpie, python-requests, etc.) also get SSR
  // All real browsers include "mozilla" in their UA string
  if (!ua.includes('mozilla')) return true;
  return false;
}

// ── Crawler visit statistics (in-memory) ──
export const crawlerStats = {
  total: 0,
  startedAt: new Date().toISOString(),
  bots: {},   // { 'Googlebot': { count, paths: {}, lastSeen, firstSeen } }
};

export function identifyCrawler(userAgent) {
  if (!userAgent) return 'unknown';
  const ua = userAgent.toLowerCase();
  for (const bot of CRAWLER_USER_AGENTS) {
    if (ua.includes(bot.toLowerCase())) return bot;
  }
  if (!ua.includes('mozilla')) return 'non-browser';
  return 'unknown';
}

export function trackCrawlerVisit(req) {
  const ua = req.headers['user-agent'] || '';
  const bot = identifyCrawler(ua);
  const path = req.path;
  const now = new Date().toISOString();

  crawlerStats.total++;

  if (!crawlerStats.bots[bot]) {
    crawlerStats.bots[bot] = { count: 0, paths: {}, firstSeen: now, lastSeen: now };
  }
  const entry = crawlerStats.bots[bot];
  entry.count++;
  entry.lastSeen = now;
  entry.paths[path] = (entry.paths[path] || 0) + 1;

  // Keep only top 50 paths per bot to avoid memory bloat
  const pathKeys = Object.keys(entry.paths);
  if (pathKeys.length > 100) {
    const sorted = pathKeys.sort((a, b) => entry.paths[b] - entry.paths[a]);
    const keep = new Set(sorted.slice(0, 50));
    for (const k of pathKeys) {
      if (!keep.has(k)) delete entry.paths[k];
    }
  }
}
