import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStockQuote, useStockHistory } from '../../hooks/useGieldaData';
import { AreaChart, PriceChange } from '../../components/gielda';
import { getStockDisplaySymbol } from '../../types/gielda';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft } from 'lucide-react';

const RANGES = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '1y', label: '1R' },
];

export function IndexDetailPage() {
  const { symbol } = useParams<{ symbol: string }>();
  const decodedSymbol = symbol ? decodeURIComponent(symbol) : '';

  const [selectedRange, setSelectedRange] = useState('1mo');

  const { stock: index, loading: indexLoading, error: indexError } = useStockQuote(decodedSymbol);
  const { history, loading: historyLoading } = useStockHistory(decodedSymbol, selectedRange);

  if (indexError) {
    return (
      <div className="index-detail-page">
        <Link
          to="/gielda/indeksy"
          className="inline-flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Powrót do indeksów
        </Link>
        <div className="rounded-lg p-4 border border-red-600/20 bg-red-600/5 text-red-700 dark:text-red-400">
          <p className="font-medium">Nie udało się załadować danych indeksu.</p>
        </div>
      </div>
    );
  }

  const displaySymbol = getStockDisplaySymbol(decodedSymbol);

  return (
    <div className="index-detail-page">
      <Link
        to="/gielda/indeksy"
        className="inline-flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Powrót do indeksów
      </Link>

      {indexLoading && !index ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : index ? (
        <>
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <h1 className="text-3xl font-bold text-black dark:text-white mb-1">
                  {index.name || displaySymbol}
                </h1>
                <p className="text-black/50 dark:text-white/50">{displaySymbol}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-black dark:text-white">
                  {index.price.toLocaleString('pl-PL', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </div>
                <PriceChange
                  change={index.change}
                  percent={index.changePercent}
                  size="lg"
                  showValue
                />
              </div>
            </div>
          </header>

          {/* Chart */}
          <section className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {RANGES.map(range => (
                <button
                  key={range.value}
                  onClick={() => setSelectedRange(range.value)}
                  className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                    selectedRange === range.value
                      ? 'bg-black text-white dark:bg-white dark:text-black'
                      : 'text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
            {historyLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : (
              <AreaChart data={history?.data || []} height={256} />
            )}
          </section>

          {/* Details */}
          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">Otwarcie</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {index.open
                  ? index.open.toLocaleString('pl-PL', { minimumFractionDigits: 2 })
                  : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">Poprzednie zamknięcie</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {index.previousClose
                  ? index.previousClose.toLocaleString('pl-PL', { minimumFractionDigits: 2 })
                  : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">Dzienny zakres</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {index.dayLow && index.dayHigh
                  ? `${index.dayLow.toFixed(2)} - ${index.dayHigh.toFixed(2)}`
                  : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">52-tyg. zakres</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {index.fiftyTwoWeekLow && index.fiftyTwoWeekHigh
                  ? `${index.fiftyTwoWeekLow.toFixed(2)} - ${index.fiftyTwoWeekHigh.toFixed(2)}`
                  : '-'}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
