import { stripHtml } from './text.js';
import { BREADCRUMB_NAMES } from '../data/translations.js';

// Schema.org JSON-LD generators for AEO (Answer Engine Optimization)
export function generateNewsArticleSchema(opts) {
  const { headline, description, datePublished, dateModified, targetUrl, ogImage, lang = 'pl', articleBody = null, keywords = null } = opts;
  const inLanguageMap = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline,
    description,
    ...(articleBody ? { articleBody } : {}),
    ...(keywords?.length ? { keywords } : {}),
    inLanguage: inLanguageMap[lang] || 'pl-PL',
    isAccessibleForFree: true,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    url: targetUrl,
    image: ogImage,
    author: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news',
      logo: {
        '@type': 'ImageObject',
        url: 'https://pollar.news/logo.png'
      }
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': targetUrl
    },
    license: 'https://creativecommons.org/licenses/by-nc-sa/4.0/',
    creditText: 'Pollar News (pollar.news) · CC BY-NC-SA 4.0',
    acquireLicensePage: 'https://pollar.news/regulamin#licencja',
    copyrightHolder: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news'
    }
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'NewsMediaOrganization',
    name: 'Pollar News',
    url: 'https://pollar.news',
    alternateName: ['Pollar', 'pollar.news', 'pollar.pl'],
    description: 'AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.',
    logo: {
      '@type': 'ImageObject',
      url: 'https://pollar.news/logo.png'
    },
    foundingDate: '2025',
    founders: [
      { '@type': 'Person', name: 'Jakub Dudek' },
      { '@type': 'Person', name: 'Bartosz Kasprzycki' },
      { '@type': 'Person', name: 'Ignacy Nowina Konopka' }
    ],
    sameAs: [
      'https://pollar.pl',
      'https://x.com/pollarnews',
      'https://www.linkedin.com/company/108790026/',
      'https://instagram.com/pollar.news'
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'jakubdudek@pollar.news',
      contactType: 'customer service'
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Kraków',
      addressCountry: 'PL'
    },
    knowsLanguage: ['pl', 'en', 'de']
  };
}

// FAQPage schema generator for AEO
export function generateFAQSchema(faqItems) {
  if (!faqItems || faqItems.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };
}

// LiveBlogPosting schema for BREAKING/HOT events — Google shows live badge
export function generateLiveBlogPostingSchema(opts) {
  const { headline, description, datePublished, dateModified, targetUrl, ogImage, lang = 'pl', articles = [], coverageStartTime = null, coverageEndTime = null } = opts;
  const inLanguageMap = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };

  // Build liveBlogUpdate entries from articles (newest first, max 20)
  const sortedArticles = [...articles]
    .sort((a, b) => new Date(b.publishDate || b.createdAt || 0) - new Date(a.publishDate || a.createdAt || 0))
    .slice(0, 20);

  const blogUpdates = sortedArticles.map((article, i) => ({
    '@type': 'BlogPosting',
    headline: stripHtml(article.title || ''),
    datePublished: article.publishDate || article.createdAt || datePublished,
    ...(article.url ? { url: article.url } : {}),
    author: {
      '@type': 'Organization',
      name: article.source || 'Pollar News'
    }
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'LiveBlogPosting',
    headline,
    description,
    inLanguage: inLanguageMap[lang] || 'pl-PL',
    url: targetUrl,
    image: ogImage,
    datePublished: datePublished || new Date().toISOString(),
    dateModified: dateModified || datePublished || new Date().toISOString(),
    coverageStartTime: coverageStartTime || datePublished || new Date().toISOString(),
    ...(coverageEndTime ? { coverageEndTime } : {}),
    author: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news'
    },
    publisher: {
      '@type': 'Organization',
      name: 'Pollar News',
      url: 'https://pollar.news',
      logo: { '@type': 'ImageObject', url: 'https://pollar.news/logo.png' }
    },
    ...(blogUpdates.length > 0 ? { liveBlogUpdate: blogUpdates } : {})
  };
}

// Speakable schema — tells voice assistants which content to read aloud
export function addSpeakable(schema, speakableSelectors = ['.article-body', '.summary', '.key-points']) {
  if (!schema) return schema;
  return {
    ...schema,
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: speakableSelectors
    }
  };
}

export function generatePersonSchema(opts) {
  const { name, club, partyName, birthDate, birthLocation, email, photoUrl, targetUrl } = opts;
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    jobTitle: 'Poseł na Sejm RP',
    memberOf: {
      '@type': 'Organization',
      name: partyName || club,
    },
    worksFor: {
      '@type': 'GovernmentOrganization',
      name: 'Sejm Rzeczypospolitej Polskiej',
      url: 'https://sejm.gov.pl'
    },
    ...(photoUrl ? { image: photoUrl } : {}),
    url: targetUrl,
    ...(birthDate ? { birthDate } : {}),
    ...(birthLocation ? { birthPlace: { '@type': 'Place', name: birthLocation } } : {}),
    ...(email ? { email } : {}),
  };
}

export function generateBreadcrumbSchema(path, pageTitles, lang = 'pl') {
  const baseUrl = 'https://pollar.news';
  const segments = path.split('/').filter(Boolean);

  if (segments.length === 0) return null;

  const items = [
    { '@type': 'ListItem', position: 1, name: 'Pollar', item: baseUrl }
  ];

  let currentPath = '';
  for (let i = 0; i < segments.length; i++) {
    currentPath += '/' + segments[i];
    const entry = pageTitles[currentPath];
    const pageInfo = entry?.[lang] || entry?.pl;
    const name = pageInfo?.title || BREADCRUMB_NAMES[segments[i]] || segments[i];

    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name,
      item: baseUrl + currentPath
    });
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items
  };
}
