import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { sejmApi } from '../utils/sejm-api';
import type { SejmPrint, PrintsResponse, PrintAISummary, PrintContentResponse } from '../types/sejm';

const PAGE_SIZE = 20;

export function usePrints() {
  const [allItems, setAllItems] = useState<SejmPrint[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, error, isLoading } = useSWR<PrintsResponse>(
    '/sejm/prints?limit=20&offset=0',
    () => sejmApi.prints.list({ limit: PAGE_SIZE, offset: 0 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
      onSuccess: (data) => {
        setAllItems(data.items);
        setHasMore(data.hasMore);
      },
    }
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await sejmApi.prints.list({
        limit: PAGE_SIZE,
        offset: allItems.length,
      });
      setAllItems(prev => [...prev, ...response.items]);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load more prints:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [allItems.length, hasMore, loadingMore]);

  return {
    prints: allItems.length > 0 ? allItems : (data?.items ?? []),
    total: data?.total ?? 0,
    hasMore,
    loading: isLoading,
    loadingMore,
    loadMore,
    error: error ?? null,
  };
}

export function usePrint(printNumber: string | null) {
  const { data, error, isLoading } = useSWR<SejmPrint | null>(
    printNumber ? `/sejm/prints/direct/${printNumber}` : null,
    () => printNumber ? sejmApi.prints.get(printNumber) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    print: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}

export function usePrintAISummary(printNumber: string | null) {
  const { data, error, isLoading } = useSWR<PrintAISummary | null>(
    printNumber ? `/sejm/prints/${printNumber}/ai-summary` : null,
    () => printNumber ? sejmApi.prints.getAISummary(printNumber) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes - AI summaries don't change often
    }
  );

  return {
    summary: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}

export function usePrintContent(printNumber: string | null) {
  const { data, error, isLoading } = useSWR<PrintContentResponse | null>(
    printNumber ? `/sejm/prints/${printNumber}/content` : null,
    () => printNumber ? sejmApi.prints.getContent(printNumber) : null,
    {
      revalidateOnFocus: false,
      dedupingInterval: 600000, // 10 minutes - content doesn't change
    }
  );

  return {
    content: data ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
