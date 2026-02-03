import useSWR from 'swr';
import { API_BASE } from '../config/api';
import type { Stock, IndexData, StockHistory } from '../types/gielda';

// Parse Yahoo Finance chart response into Stock object
function parseChartResponse(data: any): Stock | null {
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta;
  const quote = result.indicators?.quote?.[0];
  const timestamps = result.timestamp || [];
  const lastIndex = timestamps.length - 1;

  const currentPrice = meta.regularMarketPrice || 0;
  const previousClose = meta.chartPreviousClose || meta.previousClose || currentPrice;
  const change = currentPrice - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  return {
    symbol: meta.symbol,
    name: meta.longName || meta.shortName || meta.symbol,
    shortName: meta.shortName,
    price: currentPrice,
    change,
    changePercent,
    volume: meta.regularMarketVolume || (quote?.volume?.[lastIndex] ?? 0),
    marketCap: meta.marketCap,
    dayHigh: meta.regularMarketDayHigh || (quote?.high?.[lastIndex] ?? 0),
    dayLow: meta.regularMarketDayLow || (quote?.low?.[lastIndex] ?? 0),
    previousClose,
    open: quote?.open?.[lastIndex] ?? meta.regularMarketOpen,
    fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
    fiftyTwoWeekLow: meta.fiftyTwoWeekLow,
    currency: meta.currency || 'PLN',
    exchange: meta.exchangeName || meta.fullExchangeName || 'Unknown',
  };
}

// Parse Yahoo Finance chart response into IndexData object
function parseIndexResponse(data: any): IndexData | null {
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta;
  const currentValue = meta.regularMarketPrice || 0;
  const previousClose = meta.chartPreviousClose || meta.previousClose || currentValue;
  const change = currentValue - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  return {
    symbol: meta.symbol,
    name: meta.longName || meta.shortName || meta.symbol,
    value: currentValue,
    change,
    changePercent,
    previousClose,
  };
}

// Fetcher for multiple quotes
async function fetchQuotes(symbols: string[]): Promise<Stock[]> {
  const url = `${API_BASE}/gielda/quotes?symbols=${symbols.map(s => encodeURIComponent(s)).join(',')}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const dataArray = await response.json();
  return dataArray
    .map(parseChartResponse)
    .filter((s: Stock | null): s is Stock => s !== null);
}

// Fetcher for multiple indices
async function fetchIndices(symbols: string[]): Promise<IndexData[]> {
  const url = `${API_BASE}/gielda/quotes?symbols=${symbols.map(s => encodeURIComponent(s)).join(',')}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const dataArray = await response.json();
  return dataArray
    .map(parseIndexResponse)
    .filter((i: IndexData | null): i is IndexData => i !== null);
}

// Import stock lists
import { WIG20_STOCKS as WIG20, MWIG40_STOCKS as MWIG40, INDICES as INDEX_LIST } from '../types/gielda';

export function useGieldaData() {
  const stockSymbols = [...WIG20.map(s => s.symbol), ...MWIG40.map(s => s.symbol)];
  const indexSymbols = INDEX_LIST.map(i => i.symbol);

  const { data: stocks, error: stocksError, isLoading: stocksLoading, mutate: mutateStocks } = useSWR(
    ['gielda-stocks', stockSymbols],
    () => fetchQuotes(stockSymbols),
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const { data: indices, error: indicesError, isLoading: indicesLoading, mutate: mutateIndices } = useSWR(
    ['gielda-indices', indexSymbols],
    () => fetchIndices(indexSymbols),
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
      dedupingInterval: 10000,
    }
  );

  const refresh = () => {
    mutateStocks();
    mutateIndices();
  };

  // Derived data
  const topGainers = (stocks || [])
    .filter(s => s.changePercent > 0)
    .sort((a, b) => b.changePercent - a.changePercent)
    .slice(0, 5);

  const topLosers = (stocks || [])
    .filter(s => s.changePercent < 0)
    .sort((a, b) => a.changePercent - b.changePercent)
    .slice(0, 5);

  const mostActive = [...(stocks || [])]
    .sort((a, b) => b.volume - a.volume)
    .slice(0, 5);

  const polishIndices = (indices || []).filter(i => i.symbol.includes('.WA'));
  const globalIndices = (indices || []).filter(i => i.symbol.startsWith('^'));

  return {
    stocks: stocks || [],
    indices: indices || [],
    loading: stocksLoading || indicesLoading,
    error: stocksError || indicesError,
    refresh,
    topGainers,
    topLosers,
    mostActive,
    polishIndices,
    globalIndices,
  };
}

export function useStockQuote(symbol: string | null) {
  const { data, error, isLoading, mutate } = useSWR(
    symbol ? ['gielda-quote', symbol] : null,
    async () => {
      const response = await fetch(`${API_BASE}/gielda/quote/${encodeURIComponent(symbol!)}`);
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const data = await response.json();
      return parseChartResponse(data);
    },
    {
      refreshInterval: 30000,
      revalidateOnFocus: false,
    }
  );

  return {
    stock: data || null,
    loading: isLoading,
    error,
    refresh: mutate,
  };
}

export function useStockHistory(symbol: string | null, range: string = '1mo') {
  const { data, error, isLoading } = useSWR(
    symbol ? ['gielda-history', symbol, range] : null,
    async () => {
      const response = await fetch(
        `${API_BASE}/gielda/history/${encodeURIComponent(symbol!)}?range=${range}`
      );
      if (!response.ok) throw new Error(`API error: ${response.status}`);
      const rawData = await response.json();

      const result = rawData?.chart?.result?.[0];
      if (!result) return null;

      const meta = result.meta;
      const timestamps = result.timestamp || [];
      const quote = result.indicators?.quote?.[0] || {};
      const adjclose = result.indicators?.adjclose?.[0]?.adjclose || quote.close || [];
      const isIntraday = range === '1d' || range === '5d';

      const dataPoints = timestamps.map((ts: number, i: number) => {
        const date = new Date(ts * 1000);
        const formattedDate = isIntraday
          ? date.toLocaleDateString('pl-PL', {
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            })
          : date.toLocaleDateString('pl-PL', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            });

        return {
          date: formattedDate,
          open: quote.open?.[i] ?? 0,
          high: quote.high?.[i] ?? 0,
          low: quote.low?.[i] ?? 0,
          close: adjclose[i] ?? quote.close?.[i] ?? 0,
          volume: quote.volume?.[i] ?? 0,
        };
      }).filter((d: any) => d.close > 0);

      return {
        symbol: meta.symbol,
        data: dataPoints,
        currency: meta.currency || 'PLN',
      } as StockHistory;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    history: data || null,
    loading: isLoading,
    error,
  };
}
