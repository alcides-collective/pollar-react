import { Router } from 'express';
import { crawlerStats } from '../utils/crawler.js';

export const crawlerStatsRoutes = Router();

// ── Crawler stats endpoint ──
crawlerStatsRoutes.get('/api/crawler-stats', (req, res) => {
  const uptime = Math.floor((Date.now() - new Date(crawlerStats.startedAt).getTime()) / 1000);
  const days = Math.floor(uptime / 86400);
  const hours = Math.floor((uptime % 86400) / 3600);
  const mins = Math.floor((uptime % 3600) / 60);

  // Sort bots by count descending
  const sortedBots = Object.entries(crawlerStats.bots)
    .sort(([, a], [, b]) => b.count - a.count)
    .map(([name, data]) => {
      // Top 10 paths per bot
      const topPaths = Object.entries(data.paths)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([path, count]) => ({ path, count }));
      return {
        name,
        count: data.count,
        firstSeen: data.firstSeen,
        lastSeen: data.lastSeen,
        topPaths,
      };
    });

  res.json({
    total: crawlerStats.total,
    startedAt: crawlerStats.startedAt,
    uptime: `${days}d ${hours}h ${mins}m`,
    bots: sortedBots,
  });
});
