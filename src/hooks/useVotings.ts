import useSWR from 'swr';
import { useState, useCallback } from 'react';
import { sejmApi } from '../utils/sejm-api';
import type { VotingListItem, VotingsResponse } from '../types/sejm';

const PAGE_SIZE = 60;

export function useVotings() {
  const [allItems, setAllItems] = useState<VotingListItem[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const { data, error, isLoading } = useSWR<VotingsResponse>(
    '/sejm/votings?limit=60&offset=0',
    () => sejmApi.votings.list({ limit: PAGE_SIZE, offset: 0 }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
      onSuccess: (data) => {
        const itemsWithId = data.items.map(item => ({
          ...item,
          id: `${item.sitting}-${item.votingNumber}`,
        }));
        setAllItems(itemsWithId);
        setHasMore(data.hasMore);
      },
    }
  );

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const response = await sejmApi.votings.list({
        limit: PAGE_SIZE,
        offset: allItems.length,
      });
      const itemsWithId = response.items.map(item => ({
        ...item,
        id: `${item.sitting}-${item.votingNumber}`,
      }));
      setAllItems(prev => [...prev, ...itemsWithId]);
      setHasMore(response.hasMore);
    } catch (error) {
      console.error('Failed to load more votings:', error);
    } finally {
      setLoadingMore(false);
    }
  }, [allItems.length, hasMore, loadingMore]);

  return {
    votings: allItems.length > 0 ? allItems : (data?.items ?? []),
    total: data?.total ?? 0,
    hasMore,
    loading: isLoading,
    loadingMore,
    loadMore,
    error: error ?? null,
  };
}
