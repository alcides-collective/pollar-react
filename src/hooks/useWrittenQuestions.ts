import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { sejmApi } from '../utils/sejm-api';
import type { SejmWrittenQuestion } from '../types/sejm';

const PAGE_SIZE = 20;

export function useWrittenQuestions() {
  const [allItems, setAllItems] = useState<SejmWrittenQuestion[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, error, isLoading } = useSWR<{ items: SejmWrittenQuestion[]; total: number }>(
    '/sejm/writtenQuestions?limit=20&offset=0',
    () => sejmApi.writtenQuestions.list({ limit: PAGE_SIZE, offset: 0 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
      onSuccess: (data) => {
        setAllItems(data.items);
        setHasMore(data.items.length >= PAGE_SIZE);
      },
    }
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await sejmApi.writtenQuestions.list({
        limit: PAGE_SIZE,
        offset: allItems.length,
      });
      setAllItems(prev => [...prev, ...response.items]);
      setHasMore(response.items.length >= PAGE_SIZE);
    } catch (error) {
      console.error('Failed to load more questions:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [allItems.length, hasMore, loadingMore]);

  return {
    questions: allItems.length > 0 ? allItems : (data?.items ?? []),
    total: data?.total ?? 0,
    hasMore,
    loading: isLoading,
    loadingMore,
    loadMore,
    error: error ?? null,
  };
}

export async function fetchQuestionBody(num: number): Promise<string> {
  return sejmApi.writtenQuestions.fetchBody(num);
}
