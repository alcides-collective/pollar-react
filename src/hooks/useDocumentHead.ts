import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export type OgImageType = 'event' | 'brief' | 'felieton' | 'newsletter' | 'blog';

export interface DocumentHeadOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageTitle?: string; // Separate title for the OG image (can differ from ogTitle)
  ogImageType?: OgImageType;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
  keywords?: string[];
}

/**
 * Generates dynamic OG image URL using the /api/og endpoint
 */
export function generateOgImageUrl(title: string, type?: OgImageType): string {
  const params = new URLSearchParams();
  params.set('title', title);
  if (type) {
    params.set('type', type);
  }
  return `/api/og?${params.toString()}`;
}

const DEFAULT_TITLE = 'Pollar';
const DEFAULT_IMAGE = '/opengraph-image.jpg';

/**
 * Updates document head meta tags for SEO and social sharing.
 * Automatically resets to defaults when component unmounts.
 */
export function useDocumentHead(options: DocumentHeadOptions) {
  const { t } = useTranslation('common');
  const defaultDescription = t('defaultDescription');

  useEffect(() => {
    const {
      title,
      description,
      ogTitle,
      ogDescription,
      ogImage,
      ogImageTitle,
      ogImageType,
      ogType = 'article',
      twitterCard = 'summary_large_image',
      keywords,
    } = options;

    // Generate dynamic OG image URL if type is provided
    // Use ogImageTitle if provided, otherwise fall back to ogTitle or title
    const imageTitle = ogImageTitle || ogTitle || title || '';
    const resolvedOgImage = ogImage || (
      imageTitle && ogImageType
        ? generateOgImageUrl(imageTitle, ogImageType)
        : undefined
    );

    // Store original values for cleanup
    const originalTitle = document.title;

    // Update document title
    if (title) {
      document.title = `${title} | Pollar`;
    }

    // Helper to update or create meta tag
    const setMetaTag = (
      selector: string,
      attribute: 'name' | 'property',
      attributeValue: string,
      content: string
    ) => {
      let element = document.querySelector<HTMLMetaElement>(selector);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, attributeValue);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    };

    // Update meta description
    if (description) {
      setMetaTag('meta[name="description"]', 'name', 'description', description);
    }

    // Update Open Graph tags
    if (ogTitle || title) {
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', ogTitle || title || DEFAULT_TITLE);
    }
    if (ogDescription || description) {
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription || description || defaultDescription);
    }
    if (resolvedOgImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', resolvedOgImage);
    }
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);

    // Update Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    if (ogTitle || title) {
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', ogTitle || title || DEFAULT_TITLE);
    }
    if (ogDescription || description) {
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', ogDescription || description || defaultDescription);
    }
    if (resolvedOgImage) {
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', resolvedOgImage);
    }

    // Update keywords meta tag
    if (keywords && keywords.length > 0) {
      setMetaTag('meta[name="keywords"]', 'name', 'keywords', keywords.join(', '));
    }

    // Cleanup: reset to defaults on unmount
    return () => {
      document.title = originalTitle;
      setMetaTag('meta[name="description"]', 'name', 'description', defaultDescription);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', DEFAULT_TITLE);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', defaultDescription);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', DEFAULT_IMAGE);
      setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', DEFAULT_TITLE);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', defaultDescription);
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_IMAGE);
      const kwEl = document.querySelector('meta[name="keywords"]');
      if (kwEl) kwEl.remove();
    };
  }, [options.title, options.description, options.ogTitle, options.ogDescription, options.ogImage, options.ogImageTitle, options.ogImageType, options.ogType, options.twitterCard, options.keywords, defaultDescription]);
}
