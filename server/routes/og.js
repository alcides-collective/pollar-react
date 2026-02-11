import { Router } from 'express';
import { renderOgImage } from '../utils/ogImage.js';
import { fetchEventData, fetchMPData } from '../utils/api.js';
import { truncate, stripHtml } from '../utils/text.js';

const PARTY_NAMES = {
  'PiS': 'Prawo i Sprawiedliwość', 'KO': 'Koalicja Obywatelska',
  'Polska2050-TD': 'Polska 2050 – TD', 'PSL-TD': 'PSL – Trzecia Droga',
  'Lewica': 'Lewica', 'Konfederacja': 'Konfederacja', 'niez.': 'Niezrzeszeni',
  'TD': 'Trzecia Droga', 'PL2050-TD': 'Polska 2050 – TD', 'Polska2050': 'Polska 2050',
};

export const ogRoutes = Router();

// OG Image generation endpoint (query params)
ogRoutes.get('/api/og', async (req, res) => {
  await renderOgImage(res, req.query);
});

// OG Image for MP profile
ogRoutes.get('/api/og/mp/:id', async (req, res) => {
  const { id } = req.params;
  const mp = await fetchMPData(id);
  if (!mp) {
    return res.status(404).json({ error: 'MP not found' });
  }
  const title = mp.firstLastName || 'Poseł';
  const description = PARTY_NAMES[mp.club] || mp.club || '';
  await renderOgImage(res, { title, type: 'mp', description });
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
