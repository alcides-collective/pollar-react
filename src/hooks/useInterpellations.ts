import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { sejmApi } from '../utils/sejm-api';
import type { SejmInterpellation, InterpellationsResponse } from '../types/sejm';

const PAGE_SIZE = 20;

export function useInterpellations() {
  const [allItems, setAllItems] = useState<SejmInterpellation[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, error, isLoading } = useSWR<InterpellationsResponse>(
    '/sejm/interpellations?limit=20&offset=0',
    () => sejmApi.interpellations.list({ limit: PAGE_SIZE, offset: 0 }),
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
      const response = await sejmApi.interpellations.list({
        limit: PAGE_SIZE,
        offset: allItems.length,
      });
      setAllItems(prev => [...prev, ...response.items]);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load more interpellations:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [allItems.length, hasMore, loadingMore]);

  return {
    interpellations: allItems.length > 0 ? allItems : (data?.items ?? []),
    total: data?.total ?? 0,
    hasMore,
    loading: isLoading,
    loadingMore,
    loadMore,
    error: error ?? null,
  };
}

export async function fetchInterpellationBody(term: number, num: number): Promise<string> {
  return sejmApi.interpellations.fetchBody(term, num);
}
