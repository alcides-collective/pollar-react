import useSWR from 'swr';
import { API_BASE } from '../config/api';
import { useRouteLanguage } from './useRouteLanguage';
import type { Language } from '../stores/languageStore';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  author: { name: string };
  coverImage?: { url: string; alt?: string };
  seo: {
    metaTitle: string;
    metaDescription: string;
    ogTitle: string;
    ogDescription: string;
    ogImage?: string;
    keywords: string[];
    canonicalUrl?: string;
    noindex: boolean;
  };
  status: 'draft' | 'published';
  publishedAt?: string;
  relatedEventIds: string[];
  readingTimeMinutes: number;
  createdAt: string;
  updatedAt: string;
}

async function fetchBlogPost(url: string): Promise<BlogPost> {
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Blog post not found');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function useBlogPost(slug?: string, langOverride?: Language) {
  const storeLanguage = useRouteLanguage();
  const lang = langOverride ?? storeLanguage;
  const url = slug ? `${API_BASE}/blog/${slug}?lang=${lang}` : null;

  const { data, error, isLoading } = useSWR(url, fetchBlogPost, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  return {
    post: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
