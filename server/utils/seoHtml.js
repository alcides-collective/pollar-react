import { escapeHtml } from './text.js';

export function generateSeoHtml(opts) {
  const { pageTitle, ogTitle, description, ogImage, targetUrl, ogType = 'article', schema = null, articlePublished = null, articleModified = null, articleSection = null, newsKeywords = null, keywords = null, keywordsList = null, pathWithoutLang = null, lang = 'pl', answerCapsule = null, headline = null, ogImageAlt = null } = opts;

  // Generate JSON-LD script(s) if schema is provided (can be single object or array)
  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];
  const schemaScript = schemas
    .filter(Boolean)
    .map(s => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
    .join('\n    ');

  // Article meta tags (only for articles)
  const articleTagMetas = (keywordsList || []).map(tag => `<meta property="article:tag" content="${escapeHtml(tag)}" />`);
  const articleTags = ogType === 'article' ? [
    articlePublished ? `<meta property="article:published_time" content="${articlePublished}" />` : '',
    articleModified ? `<meta property="article:modified_time" content="${articleModified}" />` : '',
    articleSection ? `<meta property="article:section" content="${escapeHtml(articleSection)}" />` : '',
    ...articleTagMetas,
    newsKeywords ? `<meta name="news_keywords" content="${escapeHtml(newsKeywords)}" />` : '',
    keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : '',
  ].filter(Boolean).join('\n    ') : '';

  // Generate hreflang tags for all supported languages
  const baseUrlForHreflang = 'https://pollar.news';
  const basePath = pathWithoutLang || '/';
  // Strip slug from event/felieton paths — each language has its own slug
  // Slug-less URLs work fine since :slug? is optional in routing
  const hreflangPath = basePath
    .replace(/^(\/event\/[^/?#/]+)\/[^/?#]+/, '$1')
    .replace(/^(\/felieton\/[^/?#/]+)\/[^/?#]+/, '$1')
    .replace(/^(\/sejm\/poslowie\/\d+)\/[^/?#]+/, '$1');
  const hreflangTags = [
    `<link rel="alternate" hreflang="pl" href="${baseUrlForHreflang}${hreflangPath === '/' ? '' : hreflangPath}" />`,
    `<link rel="alternate" hreflang="en" href="${baseUrlForHreflang}/en${hreflangPath === '/' ? '' : hreflangPath}" />`,
    `<link rel="alternate" hreflang="de" href="${baseUrlForHreflang}/de${hreflangPath === '/' ? '' : hreflangPath}" />`,
    `<link rel="alternate" hreflang="x-default" href="${baseUrlForHreflang}${hreflangPath === '/' ? '' : hreflangPath}" />`
  ].join('\n    ');

  // og:locale for social sharing
  const ogLocaleMap = { pl: 'pl_PL', en: 'en_US', de: 'de_DE' };
  const ogLocale = ogLocaleMap[lang] || 'pl_PL';
  const redirectText = { pl: 'Przekierowywanie do', en: 'Redirecting to', de: 'Weiterleitung zu' }[lang] || 'Przekierowywanie do';

  // All meta tags use self-closing /> for iMessage compatibility
  return `<!DOCTYPE html>
<html lang="${lang}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${pageTitle}</title>
    <meta name="description" content="${escapeHtml(description)}" />
    <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:site_name" content="Pollar" />
    <meta property="og:locale" content="${ogLocale}" />
    <meta property="og:title" content="${escapeHtml(ogTitle)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:image:type" content="image/png" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:image:alt" content="${escapeHtml(ogImageAlt || headline || ogTitle)}" />
    <meta property="og:url" content="${targetUrl}" />
    ${articleTags}
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:site" content="@pollarnews" />
    <meta name="twitter:title" content="${escapeHtml(ogTitle)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    <link rel="canonical" href="${targetUrl}" />
    <link rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/" />
    ${hreflangTags}
    <link rel="alternate" type="application/rss+xml" title="Pollar News RSS" href="https://pollar.news/feed.xml" />
    ${schemaScript}
  </head>
  <body>
    <article>
      <h1>${escapeHtml(headline || ogTitle)}</h1>
      <p class="summary">${escapeHtml(description)}</p>
      ${answerCapsule ? `<div class="article-body">${answerCapsule}</div>` : ''}
    </article>
    <footer xmlns:cc="http://creativecommons.org/ns#" xmlns:dct="http://purl.org/dc/terms/">
      <span property="dct:title">Pollar News</span> by
      <a property="cc:attributionName" rel="cc:attributionURL" href="https://pollar.news">Pollar News</a>
      is licensed under
      <a rel="license" href="https://creativecommons.org/licenses/by-nc-sa/4.0/">CC BY-NC-SA 4.0</a>
    </footer>
    <p>${redirectText} <a href="${targetUrl}">${escapeHtml(headline || ogTitle)}</a>...</p>
    <script>window.location.replace(${JSON.stringify(targetUrl)});</script>
  </body>
</html>`;
}
