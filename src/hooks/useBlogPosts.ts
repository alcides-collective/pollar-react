import useSWR from 'swr';
import { API_BASE } from '../config/api';
import { useRouteLanguage } from './useRouteLanguage';
import type { Language } from '../stores/languageStore';

export interface BlogPostSummary {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  author: { name: string };
  coverImage?: { url: string; alt?: string };
  status: 'draft' | 'published';
  publishedAt?: string;
  readingTimeMinutes: number;
  createdAt: string;
}

interface BlogPostsResponse {
  posts: BlogPostSummary[];
  total: number;
  limit: number;
  offset: number;
}

async function fetchBlogPosts(url: string): Promise<BlogPostsResponse> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}

export function useBlogPosts(limit = 20, offset = 0, langOverride?: Language) {
  const storeLanguage = useRouteLanguage();
  const lang = langOverride ?? storeLanguage;
  const url = `${API_BASE}/blog?lang=${lang}&limit=${limit}&offset=${offset}`;

  const { data, error, isLoading } = useSWR(url, fetchBlogPosts, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 60000,
  });

  return {
    posts: data?.posts ?? [],
    total: data?.total ?? 0,
    loading: isLoading,
    error: error ?? null,
  };
}
