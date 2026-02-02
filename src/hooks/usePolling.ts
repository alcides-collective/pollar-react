import useSWR from 'swr';
import {
  fetchPolishPolls,
  calculateWeightedAverage,
  type PollingData,
  type WeightedAverageResult,
  type PollResult,
} from '../utils/polling-scraper';

interface UsePollingResult {
  data: PollingData | null;
  average: PollResult['results'] | null;
  uncertainty: PollResult['results'] | null;
  trend: PollResult['results'] | null;
  meta: WeightedAverageResult['meta'] | null;
  loading: boolean;
  error: Error | null;
}

const fetcher = async (): Promise<{ data: PollingData; weighted: WeightedAverageResult }> => {
  const data = await fetchPolishPolls();
  const weighted = calculateWeightedAverage(data.polls, 30);
  return { data, weighted };
};

export function usePolling(): UsePollingResult {
  const { data, error, isLoading } = useSWR('polish-polling', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 300000, // 5 minutes
  });

  return {
    data: data?.data ?? null,
    average: data?.weighted.average ?? null,
    uncertainty: data?.weighted.uncertainty ?? null,
    trend: data?.weighted.trend ?? null,
    meta: data?.weighted.meta ?? null,
    loading: isLoading,
    error: error ?? null,
  };
}
