import { API_BASE } from '../config.js';
import { PAGE_TITLES, getPageInfo } from '../data/pageTitles.js';
import { PAGE_FAQS } from '../data/pageFaqs.js';
import { getCategoryFromSlug, getCategoryTitle, getCategoryDescription, CATEGORY_TRANSLATIONS, parseCountrySlugs, getCountryTitle, getCountryDescription } from '../data/translations.js';
import { CATEGORY_COUNTRY_DESCRIPTIONS } from '../data/categoryCountryDescriptions.js';
import { isCrawler, trackCrawlerVisit } from '../utils/crawler.js';
import { escapeHtml, stripHtml, stripCustomTags, truncate, createSlug, escapeXml } from '../utils/text.js';
import { fetchEventData, fetchBriefData, fetchSimilarEvents, fetchFelietonData, fetchBlogPost, fetchBlogPosts, fetchMPData, fetchMPVotings, fetchMPsList } from '../utils/api.js';
import { generateNewsArticleSchema, generateOrganizationSchema, generateFAQSchema, generateLiveBlogPostingSchema, addSpeakable, generateBreadcrumbSchema, generatePersonSchema } from '../utils/schema.js';

const PARTY_NAMES = {
  'PiS': 'Prawo i Sprawiedliwość', 'KO': 'Koalicja Obywatelska',
  'Polska2050-TD': 'Polska 2050 – TD', 'PSL-TD': 'PSL – Trzecia Droga',
  'Lewica': 'Lewica', 'Konfederacja': 'Konfederacja', 'niez.': 'Niezrzeszeni',
  'TD': 'Trzecia Droga', 'PL2050-TD': 'Polska 2050 – TD', 'Polska2050': 'Polska 2050',
};
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

      // Mentioned people with internal MP links (fallback to Wikipedia)
      const people = event.metadata?.mentionedPeople || [];
      if (people.length > 0) {
        const allMPs = await fetchMPsList();
        const mpNameMap = new Map(allMPs.map(mp => [mp.firstLastName.toLowerCase(), mp]));

        const peopleItems = people.map(p => {
          const name = escapeHtml(p.name || '');
          const context = p.context ? ` — ${escapeHtml(stripHtml(p.context))}` : '';
          const matchedMP = mpNameMap.get((p.name || '').toLowerCase());
          if (matchedMP) {
            const mpSlug = createSlug(matchedMP.firstLastName);
            const mpLink = mpSlug ? `/sejm/poslowie/${matchedMP.id}/${mpSlug}` : `/sejm/poslowie/${matchedMP.id}`;
            return `<li><a href="https://pollar.news${langPrefix}${mpLink}">${name}</a>${context}</li>`;
          }
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

  // Blog post page
  const blogPostMatch = pathWithoutLang.match(/^\/blog\/([^/?#]+)$/);
  if (blogPostMatch) {
    const blogPost = await fetchBlogPost(blogPostMatch[1], lang);
    if (blogPost) {
      const blogTitle = blogPost.seo?.metaTitle || blogPost.title || 'Blog';
      const description = truncate(stripHtml(blogPost.seo?.metaDescription || blogPost.excerpt || ''), 160);
      const ogTitle = blogPost.seo?.ogTitle || blogTitle;
      const ogDescription = blogPost.seo?.ogDescription || description;
      const ogImage = blogPost.seo?.ogImage || blogPost.coverImage?.url || `${baseUrl}/api/og?title=${encodeURIComponent(blogTitle)}&type=blog&lang=${lang}`;
      const langPrefix = lang === 'pl' ? '' : `/${lang}`;
      const targetUrl = `${baseUrl}${langPrefix}/blog/${blogPost.slug}`;
      const keywords = blogPost.seo?.keywords || [];

      // Strip markdown for article body
      const articleBody = truncate(stripHtml(blogPost.content || '').replace(/[#*_`\[\]]/g, ''), 5000);

      // BlogPosting JSON-LD schema
      const schema = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: blogTitle,
        description,
        datePublished: blogPost.publishedAt || blogPost.createdAt,
        dateModified: blogPost.updatedAt || blogPost.publishedAt || blogPost.createdAt,
        url: targetUrl,
        image: blogPost.coverImage?.url || ogImage,
        author: { '@type': 'Person', name: blogPost.author?.name || 'Pollar' },
        publisher: { '@type': 'Organization', name: 'Pollar News', url: baseUrl, logo: { '@type': 'ImageObject', url: `${baseUrl}/logo-white.png` } },
        mainEntityOfPage: { '@type': 'WebPage', '@id': targetUrl },
        wordCount: (blogPost.content || '').split(/\s+/).length,
        timeRequired: `PT${blogPost.readingTimeMinutes || 5}M`,
        ...(articleBody ? { articleBody } : {}),
        ...(keywords.length > 0 ? { keywords: keywords.join(', ') } : {}),
      };

      // Answer capsule for AI crawlers
      const capsuleParts = [];
      if (blogPost.excerpt) {
        capsuleParts.push(`<section class="lead"><p>${escapeHtml(stripHtml(blogPost.excerpt))}</p></section>`);
      }
      if (blogPost.content) {
        const cleanContent = blogPost.content.replace(/[#*_`\[\]]/g, '');
        const paragraphs = cleanContent.split('\n\n').filter(p => p.trim()).slice(0, 20);
        const contentHtml = paragraphs.map(p => `<p>${escapeHtml(p.trim())}</p>`).join('');
        capsuleParts.push(`<section class="summary">${contentHtml}</section>`);
      }

      return res.send(generateSeoHtml({
        pageTitle: `${blogTitle} | Pollar`,
        ogTitle: `Pollar News: ${ogTitle}`,
        headline: blogTitle,
        description,
        ogImage,
        targetUrl,
        schema,
        articlePublished: blogPost.publishedAt || blogPost.createdAt,
        articleModified: blogPost.updatedAt || blogPost.publishedAt || blogPost.createdAt,
        articleSection: 'Blog',
        keywords: keywords.length > 0 ? keywords.join(', ') : null,
        keywordsList: keywords,
        pathWithoutLang,
        lang,
        answerCapsule: capsuleParts.join(''),
      }));
    }
  }

  // Blog list page
  if (pathWithoutLang === '/blog') {
    const langPrefix = lang === 'pl' ? '' : `/${lang}`;
    const blogTargetUrl = `${baseUrl}${langPrefix}/blog`;
    const blogTitles = { pl: 'Blog', en: 'Blog', de: 'Blog' };
    const blogDescriptions = {
      pl: 'Blog Pollar — artykuły, analizy i komentarze.',
      en: 'Pollar Blog — articles, analyses and commentary.',
      de: 'Pollar Blog — Artikel, Analysen und Kommentare.',
    };
    const blogTitle = blogTitles[lang] || blogTitles.pl;
    const blogDescription = blogDescriptions[lang] || blogDescriptions.pl;
    const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(blogTitle)}&type=blog&lang=${lang}`;

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'CollectionPage',
      name: blogTitle,
      description: blogDescription,
      url: blogTargetUrl,
      isPartOf: { '@type': 'WebSite', name: 'Pollar News', url: baseUrl },
    };

    // Fetch blog posts for answer capsule
    let blogCapsule = '';
    try {
      const posts = await fetchBlogPosts(lang, 10);
      if (posts.length > 0) {
        const postItems = posts.map(p => {
          const title = escapeHtml(stripHtml(p.title || ''));
          const excerpt = escapeHtml(truncate(stripHtml(p.excerpt || ''), 200));
          const link = `${baseUrl}${langPrefix}/blog/${p.slug}`;
          return `<li><a href="${link}"><strong>${title}</strong></a><br>${excerpt}</li>`;
        }).join('');
        blogCapsule = `<section class="trending"><h2>${blogTitle}</h2><ol>${postItems}</ol></section>`;
      }
    } catch { /* skip if unavailable */ }

    return res.send(generateSeoHtml({
      pageTitle: `${blogTitle} | Pollar`,
      ogTitle: `Pollar News: ${blogTitle}`,
      headline: blogTitle,
      description: blogDescription,
      ogImage,
      targetUrl: blogTargetUrl,
      ogType: 'website',
      schema,
      pathWithoutLang,
      lang,
      answerCapsule: blogCapsule || null,
    }));
  }

  // Country pages (e.g., /kraj/polska, /en/country/germany+france, /de/land/deutschland)
  const countryOnlyMatch = pathWithoutLang.match(/^\/(kraj|country|land)\/(.+)$/);
  if (countryOnlyMatch) {
    const countries = parseCountrySlugs(countryOnlyMatch[2], lang);
    if (countries.length > 0) {
      const isSingle = countries.length === 1;
      const countryNames = countries.map(c => getCountryTitle(c, lang));

      // Single country: rich custom title & description; multi: generic
      let title, description;
      if (isSingle) {
        const titleParts = { pl: 'Wiadomości: ', en: 'News: ', de: 'Nachrichten: ' };
        title = (titleParts[lang] || titleParts.pl) + countryNames[0];
        description = getCountryDescription(countries[0], lang);
      } else {
        title = countryNames.join(', ');
        const descParts = { pl: 'Wydarzenia dotyczące: ', en: 'News about: ', de: 'Nachrichten über: ' };
        description = (descParts[lang] || descParts.pl) + countryNames.join(', ');
      }

      const ogTitle = `Pollar News: ${isSingle ? countryNames[0] : title}`;
      const pageTitle = `${title} | Pollar`;
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(isSingle ? countryNames[0] : title)}&description=${encodeURIComponent(truncate(description, 200))}&lang=${lang}`;

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: targetUrl,
        isPartOf: { '@type': 'WebSite', name: 'Pollar News', url: baseUrl },
      };

      return res.send(generateSeoHtml({
        pageTitle,
        ogTitle,
        headline: title,
        description,
        ogImage,
        targetUrl,
        ogType: 'website',
        schema,
        pathWithoutLang,
        lang,
      }));
    }
  }

  // Category + Country pages (e.g., /sport/kraj/polska, /en/economy/country/germany+france)
  const catCountryMatch = pathWithoutLang.match(/^\/([^/]+)\/(kraj|country|land)\/(.+)$/);
  if (catCountryMatch) {
    const polishCategory = getCategoryFromSlug(catCountryMatch[1], lang);
    const countries = parseCountrySlugs(catCountryMatch[3], lang);
    if (polishCategory && countries.length > 0) {
      const categoryTitle = getCategoryTitle(polishCategory, lang);
      const countryNames = countries.map(c => getCountryTitle(c, lang));
      const title = `${categoryTitle} — ${countryNames.join(', ')}`;

      // Use unique description for single-country pages, generic fallback for multi-country
      let description;
      if (countries.length === 1) {
        description = CATEGORY_COUNTRY_DESCRIPTIONS[polishCategory]?.[countries[0]]?.[lang];
      }
      if (!description) {
        const categoryDesc = getCategoryDescription(polishCategory, lang);
        const countryParts = { pl: 'Kraj: ', en: 'Country: ', de: 'Land: ' };
        description = `${categoryDesc} ${countryParts[lang] || countryParts.pl}${countryNames.join(', ')}.`;
      }
      const ogTitle = `Pollar News: ${title}`;
      const pageTitle = `${title} | Pollar`;
      const ogDesc = truncate(description, 120);
      const ogImage = `${baseUrl}/api/og?title=${encodeURIComponent(title)}&description=${encodeURIComponent(ogDesc)}&lang=${lang}&category=${encodeURIComponent(polishCategory)}`;

      const schema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: title,
        description,
        url: targetUrl,
        isPartOf: { '@type': 'WebSite', name: 'Pollar News', url: baseUrl },
      };

      return res.send(generateSeoHtml({
        pageTitle,
        ogTitle,
        headline: title,
        description,
        ogImage,
        targetUrl,
        ogType: 'website',
        schema,
        pathWithoutLang,
        lang,
      }));
    }
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

  // MP profile page
  const mpMatch = pathWithoutLang.match(/^\/sejm\/poslowie\/(\d+)/);
  if (mpMatch) {
    const mp = await fetchMPData(mpMatch[1]);
    if (mp) {
      const partyName = PARTY_NAMES[mp.club] || mp.club;

      // Canonical URL with slug
      const mpSlug = createSlug(mp.firstLastName);
      const langPrefix = lang === 'pl' ? '' : `/${lang}`;
      const canonicalPath = mpSlug ? `/sejm/poslowie/${mpMatch[1]}/${mpSlug}` : `/sejm/poslowie/${mpMatch[1]}`;
      const mpTargetUrl = `${baseUrl}${langPrefix}${canonicalPath}`;

      // 301 redirect slug-less URLs to canonical slug version
      if (mpSlug && !pathWithoutLang.includes(`/${mpSlug}`)) {
        return res.redirect(301, `${langPrefix}${canonicalPath}`);
      }

      const mpTitle = `${mp.firstLastName} — Poseł ${mp.club}`;
      const description = [
        `${mp.firstLastName}, ${partyName}.`,
        mp.districtName ? `Okręg ${mp.districtNum} ${mp.districtName}, woj. ${mp.voivodeship}.` : '',
      ].filter(Boolean).join(' ');
      const ogTitle = `Pollar News: ${mp.firstLastName}`;
      const ogImage = `${baseUrl}/api/og/mp/${mpMatch[1]}`;
      const keywords = [mp.firstLastName, mp.club, partyName, mp.districtName, mp.voivodeship, 'Sejm', 'poseł'].filter(Boolean);

      // Person schema
      const personSchema = generatePersonSchema({
        name: mp.firstLastName,
        club: mp.club,
        partyName,
        birthDate: mp.birthDate,
        birthLocation: mp.birthLocation,
        email: mp.email,
        photoUrl: `https://api.sejm.gov.pl/sejm/term10/MP/${mpMatch[1]}/photo`,
        targetUrl: mpTargetUrl,
      });

      // Breadcrumb schema
      const mpBreadcrumb = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Pollar', item: baseUrl },
          { '@type': 'ListItem', position: 2, name: 'Sejm', item: `${baseUrl}${langPrefix}/sejm` },
          { '@type': 'ListItem', position: 3, name: { pl: 'Posłowie', en: 'MPs', de: 'Abgeordnete' }[lang] || 'Posłowie', item: `${baseUrl}${langPrefix}/sejm/poslowie` },
          { '@type': 'ListItem', position: 4, name: mp.firstLastName, item: mpTargetUrl },
        ]
      };

      // Answer capsule
      const capsuleParts = [];

      // Bio section
      const bioItems = [
        `<strong>${escapeHtml(mp.firstLastName)}</strong>`,
        `Klub: ${escapeHtml(partyName)} (${escapeHtml(mp.club)})`,
        mp.districtName ? `Okręg ${mp.districtNum}: ${escapeHtml(mp.districtName)}, woj. ${escapeHtml(mp.voivodeship)}` : '',
        mp.profession ? `Zawód: ${escapeHtml(mp.profession)}` : '',
        mp.educationLevel ? `Wykształcenie: ${escapeHtml(mp.educationLevel)}` : '',
        mp.numberOfVotes ? `Głosy: ${mp.numberOfVotes.toLocaleString('pl-PL')}` : '',
        mp.birthDate ? `Data urodzenia: ${mp.birthDate}` : '',
        mp.email ? `Email: ${escapeHtml(mp.email)}` : '',
      ].filter(Boolean);
      capsuleParts.push(`<section class="lead"><ul>${bioItems.map(i => `<li>${i}</li>`).join('')}</ul></section>`);

      // Recent votings
      const votings = await fetchMPVotings(mpMatch[1], 10);
      if (votings.length > 0) {
        const votingItems = votings.map(v => {
          const vTitle = escapeHtml(v.title || '');
          const vote = v.vote || v.mpVote || '';
          const voteLabel = { 'YES': 'Za', 'NO': 'Przeciw', 'ABSTAIN': 'Wstrzymał się', 'ABSENT': 'Nieobecny', 'PRESENT': 'Obecny' }[vote] || vote;
          return `<li><a href="${baseUrl}${langPrefix}/sejm/glosowania/${v.sitting}/${v.votingNumber}">${vTitle}</a> — ${voteLabel} (za: ${v.yes || 0}, przeciw: ${v.no || 0}, wstrz.: ${v.abstain || 0})</li>`;
        }).join('');
        capsuleParts.push(`<section class="summary"><h3>Ostatnie głosowania</h3><ul>${votingItems}</ul></section>`);
      }

      // Related navigation
      const navLabels = {
        pl: { allMPs: 'Wszyscy posłowie', votings: 'Głosowania Sejmu', clubs: 'Kluby parlamentarne' },
        en: { allMPs: 'All MPs', votings: 'Parliament votings', clubs: 'Parliamentary clubs' },
        de: { allMPs: 'Alle Abgeordneten', votings: 'Parlamentsabstimmungen', clubs: 'Parlamentarische Clubs' },
      };
      const nav = navLabels[lang] || navLabels.pl;
      capsuleParts.push(`<nav class="related"><h3>Sejm RP</h3><ul>
        <li><a href="${baseUrl}${langPrefix}/sejm/poslowie">${nav.allMPs}</a></li>
        <li><a href="${baseUrl}${langPrefix}/sejm/glosowania">${nav.votings}</a></li>
        <li><a href="${baseUrl}${langPrefix}/sejm/kluby">${nav.clubs}</a></li>
      </ul></nav>`);

      return res.send(generateSeoHtml({
        pageTitle: `${mp.firstLastName} — Poseł ${mp.club} | Pollar`,
        ogTitle,
        headline: mp.firstLastName,
        description,
        ogImage,
        targetUrl: mpTargetUrl,
        schema: [personSchema, mpBreadcrumb],
        keywords: keywords.join(', '),
        keywordsList: keywords,
        pathWithoutLang,
        lang,
        answerCapsule: capsuleParts.join(''),
      }));
    }
  }

  // Static pages from PAGE_TITLES map
  const pageInfo = getPageInfo(pathWithoutLang, lang);
  if (pageInfo) {
    const isHomepage = pathWithoutLang === '/';
    const ogTitle = isHomepage ? pageInfo.title : `Pollar News: ${pageInfo.title}`;
    const pageTitle = isHomepage ? `${pageInfo.title} | ${pageInfo.tagline || 'Wiesz więcej'}` : `${pageInfo.title} | Pollar`;
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
<p>Pollar News to polski agregator newsów napędzany sztuczną inteligencją. Nasz agregator wiadomości automatycznie zbiera artykuły z dziesiątek redakcji, grupuje je w wydarzenia, generuje streszczenia z kluczowymi punktami i prezentuje różne perspektywy — bez clickbaitów, tylko sprawdzone fakty.</p>
<h3>Co oferuje Pollar?</h3>
<ul>
<li><strong>Wydarzenia</strong> — zagregowane wiadomości z wielu źródeł w jednym miejscu</li>
<li><strong>Daily Brief</strong> — codzienny przegląd najważniejszych wydarzeń generowany przez AI</li>
<li><strong>Sejm RP</strong> — głosowania, posłowie, komisje, procesy legislacyjne</li>
<li><strong>Dane publiczne</strong> — giełda GPW, jakość powietrza, ceny mieszkań, energetyka, Eurostat</li>
<li><strong>Mapa wydarzeń</strong> — interaktywna mapa bieżących wydarzeń w Polsce</li>
</ul>
<p>Serwis jest dostępny w języku polskim, angielskim i niemieckim. Treści oryginalne są licencjonowane na zasadach <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — firma zarejestrowana w Krakowie (KRS 0001194489). Zespół: Jakub Dudek (Developer), Bartosz Kasprzycki (Product &amp; Marketing), Ignacy Nowina Konopka (B2B &amp; Biznes).</p>
<p><a href="https://pollar.news/kontakt">Kontakt</a> · <a href="https://pollar.news/info">O Pollar</a> · <a href="https://pollar.news/regulamin">Regulamin</a> · <a href="https://pollar.news/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`,
        en: `<section class="about">
<h2>What is Pollar News?</h2>
<p>Pollar News is a Polish AI-powered news aggregator. Our news aggregator automatically collects articles from dozens of newsrooms, groups them into events, generates summaries with key points, and presents different perspectives — no clickbait, only verified facts.</p>
<h3>What does Pollar offer?</h3>
<ul>
<li><strong>Events</strong> — aggregated news from multiple sources in one place</li>
<li><strong>Daily Brief</strong> — AI-generated daily summary of the most important events</li>
<li><strong>Polish Parliament (Sejm)</strong> — votes, MPs, committees, legislative processes</li>
<li><strong>Public data</strong> — GPW stock market, air quality, real estate prices, energy mix, Eurostat</li>
<li><strong>Event map</strong> — interactive map of current events in Poland</li>
</ul>
<p>Available in Polish, English, and German. Original content is licensed under <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — company registered in Kraków, Poland (KRS 0001194489). Team: Jakub Dudek (Developer), Bartosz Kasprzycki (Product &amp; Marketing), Ignacy Nowina Konopka (B2B &amp; Business).</p>
<p><a href="https://pollar.news/kontakt">Contact</a> · <a href="https://pollar.news/info">About</a> · <a href="https://pollar.news/regulamin">Terms</a> · <a href="https://pollar.news/en/feed.xml">RSS</a> · <a href="https://pollar.news/llms.txt">llms.txt</a></p>
</section>`,
        de: `<section class="about">
<h2>Was ist Pollar News?</h2>
<p>Pollar News ist ein polnischer KI-gestützter Nachrichten-Aggregator. Unser News-Aggregator sammelt automatisch Artikel aus Dutzenden von Redaktionen, gruppiert sie zu Ereignissen, erstellt Zusammenfassungen mit Kernpunkten und präsentiert verschiedene Perspektiven — ohne Clickbait, nur verifizierte Fakten.</p>
<h3>Was bietet Pollar?</h3>
<ul>
<li><strong>Ereignisse</strong> — aggregierte Nachrichten aus mehreren Quellen an einem Ort</li>
<li><strong>Daily Brief</strong> — KI-generierte tägliche Zusammenfassung der wichtigsten Ereignisse</li>
<li><strong>Polnisches Parlament (Sejm)</strong> — Abstimmungen, Abgeordnete, Ausschüsse, Gesetzgebung</li>
<li><strong>Öffentliche Daten</strong> — GPW-Börse, Luftqualität, Immobilienpreise, Energiemix, Eurostat</li>
<li><strong>Ereigniskarte</strong> — interaktive Karte aktueller Ereignisse in Polen</li>
</ul>
<p>Verfügbar auf Polnisch, Englisch und Deutsch. Originalinhalte sind lizenziert unter <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>.</p>
<p>Pollar P.S.A. — Unternehmen mit Sitz in Kraków, Polen (KRS 0001194489). Team: Jakub Dudek (Entwickler), Bartosz Kasprzycki (Produkt &amp; Marketing), Ignacy Nowina Konopka (B2B &amp; Business).</p>
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
