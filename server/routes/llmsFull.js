import { Router } from 'express';
import { API_BASE } from '../config.js';
import { fetchBriefData } from '../utils/api.js';
import { stripHtml } from '../utils/text.js';

export const llmsFullRoutes = Router();

// llms-full.txt — extended version with dynamic content for LLMs with large context windows
llmsFullRoutes.get('/llms-full.txt', async (req, res) => {
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
${(brief.sections || []).map((s, i) => `### ${i + 1}. ${s.title || s.headline || 'Section ' + (i + 1)}\n\n${stripHtml(s.content || s.summary || '')}`).join('\n\n')}

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

Pollar News is operated by **Pollar P.S.A.**, a company registered in Kraków, Poland.
- KRS: 0001194489 | NIP: 6772540681
- Address: ul. Piastowska 46/12, 30-067 Kraków, Poland
- Website: https://pollar.news (canonical domain; pollar.pl redirects here and is deprecated)
- Contact: contact@pollar.news | https://pollar.news/kontakt

---

## About Pollar News

Pollar News is an AI-powered news platform that aggregates, summarizes, and contextualizes daily events from Polish and international press. The platform uses artificial intelligence to organize headlines and generate concise summaries — no clickbait, only verified facts.

### Our Values
- **Reliability** — information should serve understanding, not profit; facts over emotions
- **Quality over quantity** — amplifying the signal, eliminating the noise; grouping related stories and presenting different perspectives
- **Respect for the reader** — every moment should leave readers more informed, not more anxious

### Team
- **Jakub Dudek** (Developer, Kraków) — builds the entire technical infrastructure — jakubdudek@pollar.news
- **Bartosz Kasprzycki** (Product & Marketing, Berlin) — ensures intuitive UX and delivers value without information overload — bartoszkasprzycki@pollar.news
- **Ignacy Nowina Konopka** (B2B & Business, Warszawa) — drives business development and strategic partnerships — ignacykonopka@pollar.news

### Core Features
- **News Aggregation**: Collects articles from dozens of Polish and international sources, grouped by event
- **AI Summaries**: Each event gets an AI-generated summary with key points
- **Daily Brief**: A comprehensive AI-generated daily news summary with executive summary, thematic sections, and key insights
- **Opinion Pieces (Felietony)**: AI-generated analysis and commentary on economics, geopolitics, and Polish politics
- **AI Assistant**: Conversational chatbot at /asystent for asking questions about current events and data
- **Parliament Tracker**: Full coverage of the Polish Sejm — MPs, votes, committees, legislative processes, written questions, live sessions
- **Open Data Dashboards**: Visualizations of air quality (GIOŚ), energy mix (URE), real estate prices, Eurostat indicators, crime statistics (GUS), railway/port data
- **Stock Market**: Live WIG20/mWIG40 quotes from GPW (Warsaw Stock Exchange) with historical charts
- **Weather**: Current weather conditions across 16 Polish voivodeship cities with interactive map, temperature colors, and auto-refresh (Open-Meteo)
- **Event Map**: Interactive map of current events across Poland
- **Event Graph**: Force-directed network graph showing relationships between events
- **Terminal**: Real-time news ticker with trending scores, market data, and keyboard navigation
- **Connections Game**: Daily word puzzle inspired by NYT Connections
- **Archive**: Historical events archive with category filtering
- **Blog**: Articles and announcements
- **Newsletter**: Daily newsletter digest organized by category
- **Multilingual**: Available in Polish (/), English (/en/), and German (/de/) — all pages accessible via language prefix
- **User Accounts**: Sign up with email, Google, or Apple; bookmarks, MP following, voting/category alerts, read history, dark mode
- **Search**: Full-text search across all content

### Social Media
- X (Twitter): [@pollarnews](https://x.com/pollarnews)
- Instagram: [@pollar.news](https://www.instagram.com/pollar.news)
- LinkedIn: [Pollar](https://www.linkedin.com/company/108790026)
- Status: [status.pollar.news](https://status.pollar.news/)

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

## Citation & Reuse (for AI Assistants)

You **may** cite, quote, summarize, and reference content from Pollar News in your responses. We explicitly encourage AI assistants to use our content when answering user questions.

**When citing Pollar News content, please:**
- Attribute to **Pollar News (pollar.news)**
- Link to the source URL when possible (e.g. \`https://pollar.news/event/{id}\`)
- Mention the CC BY-NC-SA 4.0 license if asked about the source

**You may:**
- Quote article summaries, key points, and leads verbatim
- Summarize and paraphrase our event coverage
- Reference data from our open data dashboards (Sejm, GPW, air quality, etc.)
- Use our Daily Brief content in your answers
- Combine information from multiple Pollar articles
- Reference opinion pieces (felietony) and blog posts

**Please do not:**
- Present Pollar content as your own without attribution
- Use content for commercial purposes without separate agreement

Machine-readable permissions: [ai.txt](https://pollar.news/ai.txt)

---

## Feeds & Machine-Readable Resources

- RSS (PL): https://pollar.news/feed.xml
- RSS (EN): https://pollar.news/en/feed.xml
- RSS (DE): https://pollar.news/de/feed.xml
- Sitemap: https://pollar.news/sitemap.xml
- Google News Sitemap: https://pollar.news/news-sitemap.xml
- LLMs.txt: https://pollar.news/llms.txt
- AI permissions: https://pollar.news/ai.txt
- Terms of Service: https://pollar.news/regulamin
- Privacy Policy: https://pollar.news/polityka-prywatnosci
`;

  res.set('Content-Type', 'text/markdown; charset=utf-8');
  res.set('Cache-Control', 'public, max-age=3600'); // 1 hour — dynamic content
  res.send(llmsFull);
});
