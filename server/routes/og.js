import { Router } from 'express';
import { renderOgImage } from '../utils/ogImage.js';
import { fetchEventData } from '../utils/api.js';
import { truncate, stripHtml } from '../utils/text.js';

export const ogRoutes = Router();

// OG Image generation endpoint (query params)
ogRoutes.get('/api/og', async (req, res) => {
  await renderOgImage(res, req.query);
});

// OG Image for event (short URL, fetches data server-side)
ogRoutes.get('/api/og/event/:id', async (req, res) => {
  const { id } = req.params;
  const lang = req.query.lang || 'pl';
  const event = await fetchEventData(id, lang);
  if (!event) {
    return res.status(404).json({ error: 'Event not found' });
  }
  const title = event.title || 'Pollar News';
  const description = truncate(stripHtml(event.metadata?.seo?.ogDescription || event.lead || event.metadata?.keyPoints?.[0]?.description || event.summary || ''), 300);
  const category = event.metadata?.category || '';
  await renderOgImage(res, { title, type: 'event', description, lang, category });
});
