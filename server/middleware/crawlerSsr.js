import { API_BASE } from '../config.js';
import { PAGE_TITLES, getPageInfo } from '../data/pageTitles.js';
import { PAGE_FAQS } from '../data/pageFaqs.js';
import { getCategoryFromSlug, getCategoryTitle, getCategoryDescription, CATEGORY_TRANSLATIONS } from '../data/translations.js';
import { isCrawler, trackCrawlerVisit } from '../utils/crawler.js';
import { escapeHtml, stripHtml, stripCustomTags, truncate, createSlug, escapeXml } from '../utils/text.js';
import { fetchEventData, fetchBriefData, fetchSimilarEvents, fetchFelietonData } from '../utils/api.js';
import { generateNewsArticleSchema, generateOrganizationSchema, generateFAQSchema, generateLiveBlogPostingSchema, addSpeakable, generateBreadcrumbSchema } from '../utils/schema.js';
import { generateSeoHtml } from '../utils/seoHtml.js';

export async function crawlerSsrMiddleware(req, res, next) {
  if (!isCrawler(req.headers['user-agent'])) {
    return next();
  }

  // Track crawler visit
  trackCrawlerVisit(req);

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
      const seo = event.metadata?.seo;
      const shortTitle = seo?.metaTitle || event.metadata?.ultraShortHeadline || event.title || 'Pollar';
      const ogTitle = `Pollar News: ${shortTitle}`;
      const fullTitle = event.title || 'Pollar';
      const kp = event.metadata?.keyPoints?.[0];
      const description = truncate(stripHtml(seo?.metaDescription || kp?.description || event.lead || event.summary || ''), 160);
      // For OG image, use longer description (up to 300 chars for multi-line display)
      const ogImageDescription = truncate(stripHtml(seo?.ogDescription || event.lead || kp?.description || event.summary || ''), 300);
      const eventCategory = event.metadata?.category || '';
      const ogImage = `${baseUrl}/api/og/event/${eventMatch[1]}?lang=${lang}`;

      // Canonical URL with SEO slug
      const eventSlug = createSlug(event.metadata?.ultraShortHeadline || event.title);
      const langPrefix = lang === 'pl' ? '' : `/${lang}`;
      const canonicalPath = eventSlug ? `/event/${eventMatch[1]}/${eventSlug}` : `/event/${eventMatch[1]}`;
      const targetUrl = `${baseUrl}${langPrefix}${canonicalPath}`;

      // 301 redirect slug-less URLs to canonical slug version
      if (eventSlug && !pathWithoutLang.includes(`/${eventSlug}`)) {
        return res.redirect(301, `${langPrefix}${canonicalPath}`);
      }

      // Build news_keywords and keywords from seo data or event metadata
      let newsKeywords = null;
      let seoKeywords = null;
      let keywordsList = [];
      if (seo?.keywords?.length > 0) {
        keywordsList = seo.keywords;
        newsKeywords = seo.keywords.join(', ');
        seoKeywords = newsKeywords;
      } else {
        const keywordParts = [
          event.metadata?.category,
          ...(event.metadata?.mentionedPeople?.map(p => p.name) || []),
          ...(event.metadata?.mentionedCountries || []),
          event.metadata?.location?.city
        ].filter(Boolean);
        keywordsList = keywordParts;
        newsKeywords = keywordParts.length > 0 ? keywordParts.join(', ') : null;
      }

      // Build articleBody for JSON-LD (plain text, truncated to 5000 chars)
      const articleBodyParts = [
        stripHtml(event.lead || ''),
        ...(event.metadata?.keyPoints || []).map(kp => stripHtml(kp.description || '')),
        event.summary ? stripCustomTags(event.summary) : ''
      ].filter(Boolean);
      const articleBody = truncate(articleBodyParts.join(' '), 5000);

      // Generate NewsArticle schema with speakable for AEO
      const schema = addSpeakable(generateNewsArticleSchema({
        headline: fullTitle,
        description,
        datePublished: event.createdAt || event.date,
        dateModified: event.updatedAt || event.createdAt || event.date,
        targetUrl,
        ogImage,
        lang,
        articleBody,
        keywords: keywordsList.length > 0 ? keywordsList : null
      }));

      // Build enriched answer capsule for AI crawlers
      const capsuleParts = [];

      // Lead paragraph (full text)
      if (event.lead) {
        capsuleParts.push(`<section class="lead"><p>${escapeHtml(stripHtml(event.lead))}</p></section>`);
      }

      // Key points
      const keyPoints = (event.metadata?.keyPoints || [])
        .map(kp => `<section class="key-points"><h3>${escapeHtml(stripHtml(kp.title || ''))}</h3><p>${escapeHtml(stripHtml(kp.description || ''))}</p></section>`)
        .join('');
      if (keyPoints) capsuleParts.push(keyPoints);

      // Full summary with custom tags converted to readable text (no truncation)
      if (event.summary) {
        const cleanSummary = stripCustomTags(event.summary);
        const paragraphs = cleanSummary.split('\n\n').filter(p => p.trim());
        const summaryHtml = paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
        capsuleParts.push(`<section class="summary">${summaryHtml}</section>`);
      }

      // Mentioned people with Wikipedia links
      const people = event.metadata?.mentionedPeople || [];
      if (people.length > 0) {
        const peopleItems = people.map(p => {
          const name = escapeHtml(p.name || '');
          const context = p.context ? ` — ${escapeHtml(stripHtml(p.context))}` : '';
          return p.wikipediaUrl
            ? `<li><a href="${escapeHtml(p.wikipediaUrl)}">${name}</a>${context}</li>`
            : `<li>${name}${context}</li>`;
        }).join('');
        capsuleParts.push(`<section class="people"><h3>Mentioned People</h3><ul>${peopleItems}</ul></section>`);
      }

      // Source articles (top 10)
      const articles = (event.articles || []).slice(0, 10);
      if (articles.length > 0) {
        const totalArticles = event.metadata?.articleCount || event.articles?.length || articles.length;
        const totalSources = event.metadata?.sourceCount || '';
        const sourceItems = articles.map(a => {
          const title = escapeHtml(stripHtml(a.title || ''));
          const source = a.source ? ` (${escapeHtml(a.source)})` : '';
          return a.url
            ? `<li><a href="${escapeHtml(a.url)}">${title}</a>${source}</li>`
            : `<li>${title}${source}</li>`;
        }).join('');
        const heading = totalSources ? `Sources: ${totalArticles} articles from ${totalSources} sources` : `Sources: ${totalArticles} articles`;
        capsuleParts.push(`<section class="sources"><h3>${heading}</h3><ul>${sourceItems}</ul></section>`);
      }

      // Related events (internal linking for SEO)
      const similarEvents = await fetchSimilarEvents(eventMatch[1], lang);
      if (similarEvents.length > 0) {
        const relatedItems = similarEvents.slice(0, 5).map(e => {
          const title = escapeHtml(stripHtml(e.title || ''));
          const relSlug = createSlug(e.metadata?.ultraShortHeadline || e.title);
          const relPath = relSlug ? `/event/${e.id}/${relSlug}` : `/event/${e.id}`;
          const link = `https://pollar.news${langPrefix}${relPath}`;
          return `<li><a href="${link}">${title}</a></li>`;
        }).join('');
        const relatedHeading = { pl: 'Powiązane wydarzenia', en: 'Related Events', de: 'Verwandte Ereignisse' }[lang] || 'Powiązane wydarzenia';
        capsuleParts.push(`<nav class="related"><h3>${relatedHeading}</h3><ul>${relatedItems}</ul></nav>`);
      }

      const answerCapsule = capsuleParts.join('');

      // Use LiveBlogPosting schema for BREAKING/HOT events (Google live badge)
      const freshnessLevel = event.freshnessLevel || event.metadata?.freshnessLevel;
      const isLive = freshnessLevel === 'BREAKING' || freshnessLevel === 'HOT';
      let schemas;
      if (isLive && (event.articles || []).length > 0) {
        const liveBlogSchema = addSpeakable(generateLiveBlogPostingSchema({
          headline: fullTitle,
          description,
          datePublished: event.createdAt || event.date,
          dateModified: event.updatedAt || event.createdAt || event.date,
          targetUrl,
          ogImage,
          lang,
          articles: event.articles || [],
          coverageStartTime: event.createdAt || event.date,
        }));
        schemas = [schema, liveBlogSchema];
      } else {
        schemas = schema;
      }

      return res.send(generateSeoHtml({
        pageTitle: `${shortTitle} | Pollar`,
        ogTitle,
        headline: fullTitle,
        description,
        ogImage,
        targetUrl,
        schema: schemas,
        articlePublished: event.createdAt || event.date,
        articleModified: event.updatedAt || event.createdAt || event.date,
        articleSection: event.metadata?.category,
        newsKeywords,
        keywords: seoKeywords,
        keywordsList,
        pathWithoutLang,
        lang,
        answerCapsule
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

    // Generate NewsArticle schema with speakable for AEO
    const schema = addSpeakable(generateNewsArticleSchema({
      headline: imageTitle,
      description,
      datePublished: brief?.date,
      dateModified: brief?.generatedAt || brief?.date,
      targetUrl,
      ogImage,
      lang
    }));

    // Build answer capsule with executive summary and sections for AI crawlers
    let briefCapsule = '';
    if (brief) {
      if (brief.executiveSummary) {
        briefCapsule += `<section class="summary"><h2>Executive Summary</h2><p>${escapeHtml(stripHtml(brief.executiveSummary))}</p></section>`;
      }
      if (brief.sections?.length) {
        briefCapsule += brief.sections.map(s =>
          `<section class="key-points"><h3>${escapeHtml(stripHtml(s.title || ''))}</h3><p>${escapeHtml(truncate(stripHtml(s.content || s.summary || ''), 300))}</p></section>`
        ).join('');
      }
    }

    return res.send(generateSeoHtml({
      pageTitle: `${briefTitle} | Pollar`,
      ogTitle,
      headline: imageTitle,
      description,
      ogImage,
      targetUrl,
      schema,
      articlePublished: brief?.date || brief?.generatedAt,
      articleSection: 'Daily Brief',
      pathWithoutLang,
      lang,
      answerCapsule: briefCapsule
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

    // Canonical URL with SEO slug
    const felietonSlug = createSlug(felieton?.title || felietonTitle);
    const felietonLangPrefix = lang === 'pl' ? '' : `/${lang}`;
    const felietonCanonical = felietonSlug ? `/felieton/${felietonMatch[1]}/${felietonSlug}` : `/felieton/${felietonMatch[1]}`;
    const targetUrl = `${baseUrl}${felietonLangPrefix}${felietonCanonical}`;

    // 301 redirect slug-less URLs to canonical slug version
    if (felietonSlug && !pathWithoutLang.includes(`/${felietonSlug}`)) {
      return res.redirect(301, `${felietonLangPrefix}${felietonCanonical}`);
    }

    const ogTitle = `Pollar News: ${felietonTitle}`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(felietonTitle)}&type=felieton&description=${encodeURIComponent(ogImageDescription)}&lang=${lang}`;

    // Build articleBody for JSON-LD (plain text, truncated to 5000 chars)
    const felietonBodyParts = [
      stripHtml(felieton?.lead || ''),
      felieton?.content ? stripHtml(stripCustomTags(felieton.content)) : ''
    ].filter(Boolean);
    const articleBody = truncate(felietonBodyParts.join(' '), 5000);

    // Build keywords from category
    const felietonKeywords = [felieton?.category].filter(Boolean);

    // Generate NewsArticle schema with speakable for AEO
    const schema = addSpeakable(generateNewsArticleSchema({
      headline: felietonTitle,
      description,
      datePublished: felieton?.createdAt || felieton?.date,
      dateModified: felieton?.generatedAt || felieton?.createdAt || felieton?.date,
      targetUrl,
      ogImage,
      lang,
      articleBody,
      keywords: felietonKeywords.length > 0 ? felietonKeywords : null
    }));

    // Build enriched answer capsule for AI crawlers
    const capsuleParts = [];

    // Lead paragraph
    if (felieton?.lead) {
      capsuleParts.push(`<section class="lead"><p>${escapeHtml(stripHtml(felieton.lead))}</p></section>`);
    }

    // Full content body (cleaned of custom tags, split into paragraphs)
    if (felieton?.content) {
      const cleanContent = stripCustomTags(felieton.content);
      const paragraphs = cleanContent.split('\n\n').filter(p => p.trim());
      const contentHtml = paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
      capsuleParts.push(`<section class="summary">${contentHtml}</section>`);
    }

    // Source events (related events with key points)
    const sourceEvents = felieton?.sourceEvents || [];
    if (sourceEvents.length > 0) {
      const sourceItems = sourceEvents.map(se => {
        const seTitle = escapeHtml(stripHtml(se.metadata?.ultraShortHeadline || se.title || ''));
        const seSlug = createSlug(se.metadata?.ultraShortHeadline || se.title);
        const sePath = seSlug ? `/event/${se.id}/${seSlug}` : `/event/${se.id}`;
        const seLink = `${baseUrl}${felietonLangPrefix}${sePath}`;
        const kpList = (se.metadata?.keyPoints || []).slice(0, 3).map(kp =>
          `<li>${escapeHtml(stripHtml(kp.description || ''))}</li>`
        ).join('');
        return `<li><a href="${seLink}"><strong>${seTitle}</strong></a>${kpList ? `<ul>${kpList}</ul>` : ''}</li>`;
      }).join('');
      const relatedHeading = { pl: 'Powiązane wydarzenia', en: 'Related Events', de: 'Verwandte Ereignisse' }[lang] || 'Powiązane wydarzenia';
      capsuleParts.push(`<nav class="related"><h3>${relatedHeading}</h3><ul>${sourceItems}</ul></nav>`);
    }

    const felietonCapsule = capsuleParts.join('');

    return res.send(generateSeoHtml({
      pageTitle: `${felietonTitle} | Pollar`,
      ogTitle,
      headline: felietonTitle,
      description,
      ogImage,
      targetUrl,
      schema,
      articlePublished: felieton?.createdAt || felieton?.date,
      articleModified: felieton?.generatedAt || felieton?.createdAt || felieton?.date,
      articleSection: felieton?.category || 'Felieton',
      keywords: felietonKeywords.length > 0 ? felietonKeywords.join(', ') : null,
      keywordsList: felietonKeywords,
      pathWithoutLang,
      lang,
      answerCapsule: felietonCapsule
    }));
  }

  // Category pages (e.g., /sport, /en/sports, /de/wirtschaft)
  const categorySlug = pathWithoutLang.replace(/^\//, '');
  if (categorySlug && !categorySlug.includes('/')) {
    const polishCategory = getCategoryFromSlug(categorySlug, lang);
    if (polishCategory) {
      const categoryTitle = getCategoryTitle(polishCategory, lang);
      const categoryDescription = getCategoryDescription(polishCategory, lang);
      const ogTitle = `Pollar News: ${categoryTitle}`;
      const pageTitle = `${categoryTitle} | Pollar`;
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(categoryTitle)}&description=${encodeURIComponent(categoryDescription)}&lang=${lang}&category=${encodeURIComponent(polishCategory)}`;

      const webPageSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: categoryTitle,
        description: categoryDescription,
        url: targetUrl,
        isPartOf: { '@type': 'WebSite', name: 'Pollar News', url: baseUrl },
      };

      // Fetch category events for answer capsule
      let categoryCapsule = '';
      try {
        const eventsRes = await fetch(`${API_BASE}/api/events?lang=${lang}&limit=15&category=${encodeURIComponent(polishCategory)}`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || eventsData.events || []);
          if (events.length > 0) {
            const langPrefix = lang === 'pl' ? '' : `/${lang}`;
            const eventItems = events.map(e => {
              const title = escapeHtml(stripHtml(e.title || ''));
              const lead = escapeHtml(truncate(stripHtml(e.lead || e.summary || ''), 200));
              const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
              const eSlug = createSlug(e.metadata?.ultraShortHeadline || e.title);
              const ePath = eSlug ? `/event/${e.id}/${eSlug}` : `/event/${e.id}`;
              const link = `${baseUrl}${langPrefix}${ePath}`;
              const sources = e.metadata?.articleCount ? ` · ${e.metadata.articleCount} articles` : '';
              return `<li><a href="${link}"><strong>${title}</strong></a>${date ? ` <time>${date}</time>` : ''}${sources}<br>${lead}</li>`;
            }).join('');
            const heading = { pl: `Najważniejsze: ${categoryTitle}`, en: `Top: ${categoryTitle}`, de: `Top: ${categoryTitle}` }[lang] || categoryTitle;
            categoryCapsule = `<section class="trending"><h2>${heading}</h2><ol>${eventItems}</ol></section>`;
          }
        }
      } catch { /* skip if unavailable */ }

      return res.send(generateSeoHtml({
        pageTitle,
        ogTitle,
        headline: categoryTitle,
        description: categoryDescription,
        ogImage,
        targetUrl,
        ogType: 'website',
        schema: webPageSchema,
        pathWithoutLang,
        lang,
        answerCapsule: categoryCapsule || null,
      }));
    }
  }

  // Static pages from PAGE_TITLES map
  const pageInfo = getPageInfo(pathWithoutLang, lang);
  if (pageInfo) {
    const isHomepage = pathWithoutLang === '/';
    const ogTitle = isHomepage ? pageInfo.title : `Pollar News: ${pageInfo.title}`;
    const pageTitle = isHomepage ? 'Pollar — Wiesz więcej' : `${pageInfo.title} | Pollar`;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(pageInfo.title)}&description=${encodeURIComponent(pageInfo.description)}&lang=${lang}`;

    // Use Organization schema for homepage, WebPage + BreadcrumbList + FAQPage for other static pages
    let schema;
    if (isHomepage) {
      schema = generateOrganizationSchema();
    } else {
      const webPageSchema = { '@context': 'https://schema.org', '@type': 'WebPage', name: pageInfo.title, description: pageInfo.description, url: targetUrl };
      const breadcrumbSchema = generateBreadcrumbSchema(pathWithoutLang, PAGE_TITLES, lang);
      const faqData = PAGE_FAQS[pathWithoutLang]?.[lang] || PAGE_FAQS[pathWithoutLang]?.pl;
      const faqSchema = generateFAQSchema(faqData);
      const schemas = [webPageSchema, breadcrumbSchema, faqSchema].filter(Boolean);
      schema = schemas.length === 1 ? schemas[0] : schemas;
    }

    // Fetch trending events for homepage capsule
    let homepageCapsule = null;
    if (isHomepage) {
      try {
        const eventsRes = await fetch(`${API_BASE}/api/events?lang=${lang}&limit=10`);
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          const events = Array.isArray(eventsData) ? eventsData : (eventsData.data || eventsData.events || []);
          if (events.length > 0) {
            const eventItems = events.map(e => {
              const title = escapeHtml(stripHtml(e.title || ''));
              const lead = escapeHtml(truncate(stripHtml(e.lead || e.summary || ''), 200));
              const date = e.createdAt ? new Date(e.createdAt).toLocaleDateString(lang === 'de' ? 'de-DE' : lang === 'en' ? 'en-US' : 'pl-PL', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
              const category = escapeHtml(e.category || e.metadata?.category || '');
              const eSlug = createSlug(e.metadata?.ultraShortHeadline || e.title);
              const ePath = eSlug ? `/event/${e.id}/${eSlug}` : `/event/${e.id}`;
              const link = `${baseUrl}/${lang === 'pl' ? '' : lang + '/'}${ePath.slice(1)}`;
              const sources = e.metadata?.articleCount ? ` · ${e.metadata.articleCount} articles` : '';
              return `<li><a href="${link}"><strong>${title}</strong></a>${category ? ` <span class="category">[${category}]</span>` : ''}${date ? ` <time>${date}</time>` : ''}${sources}<br>${lead}</li>`;
            }).join('');
            const heading = { pl: 'Najważniejsze wydarzenia', en: 'Top Stories', de: 'Top-Nachrichten' }[lang] || 'Najważniejsze wydarzenia';
            homepageCapsule = `<section class="trending"><h2>${heading}</h2><ol>${eventItems}</ol></section>`;
          }
        }
      } catch { /* skip if unavailable */ }

      // About section at the bottom
      const about = {
        pl: `<section class="about">
<h2>Czym jest Pollar News?</h2>
<p>Pollar News to polska platforma informacyjna zasilana sztuczną inteligencją. AI automatycznie agreguje artykuły z dziesiątek redakcji, grupuje je w wydarzenia, generuje streszczenia z kluczowymi punktami i prezentuje różne perspektywy — bez clickbaitów, tylko sprawdzone fakty.</p>
<h3>Co oferuje Pollar?</h3>
<ul>
<li><strong>Wydarzenia</strong> — zagregowane wiadomości z wielu źródeł w jednym miejscu</li>
<li><strong>Daily Brief</strong> — codzienny przegląd najważniejszych wydarzeń generowany przez AI</li>
<li><strong>Sejm RP</strong> — głosowania, posłowie, komisje, procesy legislacyjne</li>
<li><strong>Dane publiczne</strong> — giełda GPW, jakość powietrza, ceny mieszkań, energetyka, Eurostat</li>
<li><strong>Mapa wydarzeń</strong> — interaktywna mapa bieżących wydarzeń w Polsce</li>
</ul>
<p>Serwis jest dostępny w języku polskim, angielskim i niemieckim. Treści oryginalne są licencjonowane na zasadach <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — firma zarejestrowana w Krakowie (KRS 0001194489). Zespół: Jakub Dudek (Developer), Bartosz Kasprzycki (Product &amp; Marketing).</p>
<p><a href="https://pollar.news/kontakt">Kontakt</a> · <a href="https://pollar.news/info">O Pollar</a> · <a href="https://pollar.news/regulamin">Regulamin</a> · <a href="https://pollar.news/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`,
        en: `<section class="about">
<h2>What is Pollar News?</h2>
<p>Pollar News is a Polish AI-powered news platform. AI automatically aggregates articles from dozens of newsrooms, groups them into events, generates summaries with key points, and presents different perspectives — no clickbait, only verified facts.</p>
<h3>What does Pollar offer?</h3>
<ul>
<li><strong>Events</strong> — aggregated news from multiple sources in one place</li>
<li><strong>Daily Brief</strong> — AI-generated daily summary of the most important events</li>
<li><strong>Polish Parliament (Sejm)</strong> — votes, MPs, committees, legislative processes</li>
<li><strong>Public data</strong> — GPW stock market, air quality, real estate prices, energy mix, Eurostat</li>
<li><strong>Event map</strong> — interactive map of current events in Poland</li>
</ul>
<p>Available in Polish, English, and German. Original content is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — company registered in Kraków, Poland (KRS 0001194489). Team: Jakub Dudek (Developer), Bartosz Kasprzycki (Product &amp; Marketing).</p>
<p><a href="https://pollar.news/kontakt">Contact</a> · <a href="https://pollar.news/info">About</a> · <a href="https://pollar.news/regulamin">Terms</a> · <a href="https://pollar.news/en/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`,
        de: `<section class="about">
<h2>Was ist Pollar News?</h2>
<p>Pollar News ist eine polnische KI-gestützte Nachrichtenplattform. KI aggregiert automatisch Artikel aus Dutzenden von Redaktionen, gruppiert sie zu Ereignissen, erstellt Zusammenfassungen mit Kernpunkten und präsentiert verschiedene Perspektiven — ohne Clickbait, nur verifizierte Fakten.</p>
<h3>Was bietet Pollar?</h3>
<ul>
<li><strong>Ereignisse</strong> — aggregierte Nachrichten aus mehreren Quellen an einem Ort</li>
<li><strong>Daily Brief</strong> — KI-generierte tägliche Zusammenfassung der wichtigsten Ereignisse</li>
<li><strong>Polnisches Parlament (Sejm)</strong> — Abstimmungen, Abgeordnete, Ausschüsse, Gesetzgebung</li>
<li><strong>Öffentliche Daten</strong> — GPW-Börse, Luftqualität, Immobilienpreise, Energiemix, Eurostat</li>
<li><strong>Ereigniskarte</strong> — interaktive Karte aktueller Ereignisse in Polen</li>
</ul>
<p>Verfügbar auf Polnisch, Englisch und Deutsch. Originalinhalte sind lizenziert unter <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — Unternehmen mit Sitz in Kraków, Polen (KRS 0001194489). Team: Jakub Dudek (Entwickler), Bartosz Kasprzycki (Produkt &amp; Marketing).</p>
<p><a href="https://pollar.news/kontakt">Kontakt</a> · <a href="https://pollar.news/info">Über uns</a> · <a href="https://pollar.news/regulamin">AGB</a> · <a href="https://pollar.news/de/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`
      };
      homepageCapsule = (homepageCapsule || '') + (about[lang] || about.pl);
    }

    return res.send(generateSeoHtml({
      pageTitle,
      ogTitle,
      headline: pageInfo.title,
      description: pageInfo.description,
      ogImage,
      targetUrl: isHomepage ? baseUrl : targetUrl,
      ogType: 'website',
      schema,
      pathWithoutLang,
      lang,
      answerCapsule: homepageCapsule
    }));
  }

  next();
}

// Crawler-specific 404 handler — return proper 404 with noindex for unknown paths
// Skip static file paths (with extensions like .png, .js, .css) — let them 404 naturally
export function crawler404Handler(req, res, next) {
  if (!isCrawler(req.headers['user-agent']) || /\.\w{2,5}$/.test(req.path)) {
    return next();
  }

  const lang = req.lang || 'pl';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
  const baseUrl = `${protocol}://${req.get('host')}`;
  const langPrefix = lang === 'pl' ? '' : `/${lang}`;

  const titles = { pl: 'Strona nie znaleziona', en: 'Page not found', de: 'Seite nicht gefunden' };
  const descriptions = {
    pl: 'Szukana strona nie istnieje lub została przeniesiona.',
    en: 'The page you are looking for does not exist or has been moved.',
    de: 'Die gesuchte Seite existiert nicht oder wurde verschoben.'
  };
  const title = titles[lang] || titles.pl;
  const description = descriptions[lang] || descriptions.pl;

  const navLabels = {
    pl: { heading: 'Przydatne linki', home: 'Strona główna', brief: 'Daily Brief', sejm: 'Sejm', data: 'Dane publiczne', contact: 'Kontakt' },
    en: { heading: 'Useful links', home: 'Homepage', brief: 'Daily Brief', sejm: 'Sejm', data: 'Public data', contact: 'Contact' },
    de: { heading: 'Nützliche Links', home: 'Startseite', brief: 'Daily Brief', sejm: 'Sejm', data: 'Öffentliche Daten', contact: 'Kontakt' },
  };
  const nav = navLabels[lang] || navLabels.pl;

  return res.status(404).send(`<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title} | Pollar</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="noindex, follow" />
    <link rel="canonical" href="${baseUrl}${langPrefix}" />
  </head>
  <body>
    <h1>${title}</h1>
    <p>${description}</p>
    <nav><h2>${nav.heading}</h2><ul>
      <li><a href="${baseUrl}${langPrefix || '/'}">${nav.home}</a></li>
      <li><a href="${baseUrl}${langPrefix}/brief">${nav.brief}</a></li>
      <li><a href="${baseUrl}${langPrefix}/sejm">${nav.sejm}</a></li>
      <li><a href="${baseUrl}${langPrefix}/dane">${nav.data}</a></li>
      <li><a href="${baseUrl}${langPrefix}/kontakt">${nav.contact}</a></li>
    </ul></nav>
    <footer xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/">
      <a property="cc:attributionName" rel="cc:attributionURL" href="https://pollar.news">Pollar News</a>
      <a rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>
    </footer>
  </body>
</html>`);
}
