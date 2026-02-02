import useSWR from 'swr';
import { sejmApi } from '../utils/sejm-api';
import type { SejmVideo } from '../types/sejm';

export function useVideos(limit?: number) {
  const { data, error, isLoading } = useSWR<SejmVideo[]>(
    `/sejm/videos?limit=${limit || 50}`,
    () => sejmApi.videos.list({ limit }),
    {
      revalidateOnFocus: false,
      dedupingInterval: 300000,
    }
  );

  return {
    videos: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}

export function useTodayVideos() {
  const { data, error, isLoading } = useSWR<SejmVideo[]>(
    '/sejm/videos/today',
    () => sejmApi.videos.today(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Check more often for live content
    }
  );

  return {
    videos: data ?? [],
    loading: isLoading,
    error: error ?? null,
  };
}
