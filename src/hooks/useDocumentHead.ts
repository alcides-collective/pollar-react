import { useEffect } from 'react';

export interface DocumentHeadOptions {
  title?: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article';
  twitterCard?: 'summary' | 'summary_large_image';
}

const DEFAULT_TITLE = 'Pollar News';
const DEFAULT_DESCRIPTION = 'Wszystkie najważniejsze wiadomości w jednym miejscu. AI porządkuje i streszcza dzisiejsze wydarzenia bez clickbaitów — tylko sprawdzone fakty.';
const DEFAULT_IMAGE = '/opengraph-image.jpg';

/**
 * Updates document head meta tags for SEO and social sharing.
 * Automatically resets to defaults when component unmounts.
 */
export function useDocumentHead(options: DocumentHeadOptions) {
  useEffect(() => {
    const {
      title,
      description,
      ogTitle,
      ogDescription,
      ogImage,
      ogType = 'article',
      twitterCard = 'summary_large_image',
    } = options;

    // Store original values for cleanup
    const originalTitle = document.title;

    // Update document title
    if (title) {
      document.title = `${title} | Pollar News`;
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
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', ogDescription || description || DEFAULT_DESCRIPTION);
    }
    if (ogImage) {
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', ogImage);
    }
    setMetaTag('meta[property="og:type"]', 'property', 'og:type', ogType);

    // Update Twitter Card tags
    setMetaTag('meta[name="twitter:card"]', 'name', 'twitter:card', twitterCard);
    if (ogTitle || title) {
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', ogTitle || title || DEFAULT_TITLE);
    }
    if (ogDescription || description) {
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', ogDescription || description || DEFAULT_DESCRIPTION);
    }
    if (ogImage) {
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', ogImage);
    }

    // Cleanup: reset to defaults on unmount
    return () => {
      document.title = originalTitle;
      setMetaTag('meta[name="description"]', 'name', 'description', DEFAULT_DESCRIPTION);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', DEFAULT_TITLE);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', DEFAULT_DESCRIPTION);
      setMetaTag('meta[property="og:image"]', 'property', 'og:image', DEFAULT_IMAGE);
      setMetaTag('meta[property="og:type"]', 'property', 'og:type', 'website');
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', DEFAULT_TITLE);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', DEFAULT_DESCRIPTION);
      setMetaTag('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_IMAGE);
    };
  }, [options.title, options.description, options.ogTitle, options.ogDescription, options.ogImage, options.ogType, options.twitterCard]);
}
