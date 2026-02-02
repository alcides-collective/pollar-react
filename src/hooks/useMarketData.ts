import { useState, useEffect } from 'react';

const API_BASE = 'https://pollar.news/api';

const INDICES = [
  { symbol: 'WIG20.WA', name: 'WIG20' },
  { symbol: 'WIG.WA', name: 'WIG' },
  { symbol: '^GSPC', name: 'S&P 500' },
  { symbol: '^IXIC', name: 'NASDAQ' },
  { symbol: '^DJI', name: 'Dow Jones' },
  { symbol: '^GDAXI', name: 'DAX' },
  { symbol: '^FTSE', name: 'FTSE 100' },
  { symbol: '^N225', name: 'Nikkei 225' },
  { symbol: '^HSI', name: 'Hang Seng' },
  { symbol: 'GC=F', name: 'Gold' },
  { symbol: 'CL=F', name: 'Crude Oil' },
  { symbol: 'EURUSD=X', name: 'EUR/USD' },
];

export interface IndexData {
  symbol: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

function parseIndexResponse(data: any): IndexData | null {
  const result = data?.chart?.result?.[0];
  if (!result) return null;

  const meta = result.meta;
  const currentValue = meta.regularMarketPrice || 0;
  const previousClose = meta.chartPreviousClose || meta.previousClose || currentValue;
  const change = currentValue - previousClose;
  const changePercent = previousClose > 0 ? (change / previousClose) * 100 : 0;

  const indexInfo = INDICES.find(i => i.symbol === meta.symbol);

  return {
    symbol: meta.symbol,
    name: indexInfo?.name || meta.shortName || meta.symbol,
    value: currentValue,
    change,
    changePercent,
  };
}

export function useMarketData() {
  const [indices, setIndices] = useState<IndexData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchIndices = async () => {
      try {
        const symbols = INDICES.map(i => encodeURIComponent(i.symbol)).join(',');
        const response = await fetch(`${API_BASE}/gielda/quotes?symbols=${symbols}`);

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const dataArray = await response.json();
        const parsed = dataArray
          .map(parseIndexResponse)
          .filter((i: IndexData | null): i is IndexData => i !== null);

        setIndices(parsed);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch market data'));
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();

    // Refresh every 30 seconds
    const interval = setInterval(fetchIndices, 30000);
    return () => clearInterval(interval);
  }, []);

  return { indices, loading, error };
}
