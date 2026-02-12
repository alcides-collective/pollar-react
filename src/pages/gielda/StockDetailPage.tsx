import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useStockQuote, useStockHistory } from '../../hooks/useGieldaData';
import { useWatchlistStore } from '../../stores/gieldaStore';
import { trackStockViewed, trackChartRangeChanged, trackWatchlistToggle } from '../../lib/analytics';
import { AreaChart, PriceChange } from '../../components/gielda';
import {
  getStockDisplaySymbol,
  formatPrice,
  formatVolume,
  formatMarketCap,
} from '../../types/gielda';
import { Skeleton } from '../../components/ui/skeleton';
import { ArrowLeft, Star } from 'lucide-react';

const RANGES = [
  { value: '1d', label: '1D' },
  { value: '5d', label: '5D' },
  { value: '1mo', label: '1M' },
  { value: '3mo', label: '3M' },
  { value: '1y', label: '1R' },
];

export function StockDetailPage() {
  const { t } = useTranslation('gielda');
  const { symbol } = useParams<{ symbol: string }>();
  const decodedSymbol = symbol ? decodeURIComponent(symbol) : '';

  const [selectedRange, setSelectedRange] = useState('1mo');

  const { stock, loading: stockLoading, error: stockError } = useStockQuote(decodedSymbol);
  const { history, loading: historyLoading } = useStockHistory(decodedSymbol, selectedRange);

  const { items, toggle } = useWatchlistStore();
  const isInWatchlist = items.some(w => w.symbol === decodedSymbol);

  useEffect(() => {
    if (decodedSymbol) trackStockViewed({ symbol: decodedSymbol });
  }, [decodedSymbol]);

  if (stockError) {
    return (
      <div className="stock-detail-page">
        <LocalizedLink
          to="/gielda/akcje"
          className="inline-flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          {t('stockDetail.backToStocks')}
        </LocalizedLink>
        <div className="rounded-lg p-4 border border-red-600/20 bg-red-600/5 text-red-700 dark:text-red-400">
          <p className="font-medium">{t('stockDetail.failedToLoad')}</p>
        </div>
      </div>
    );
  }

  const displaySymbol = getStockDisplaySymbol(decodedSymbol);

  return (
    <div className="stock-detail-page">
      <LocalizedLink
        to="/gielda/akcje"
        className="inline-flex items-center gap-2 text-sm text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        {t('stockDetail.backToStocks')}
      </LocalizedLink>

      {stockLoading && !stock ? (
        <div className="space-y-6">
          <Skeleton className="h-12 w-48" />
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : stock ? (
        <>
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-3xl font-bold text-black dark:text-white">
                    {displaySymbol}
                  </h1>
                  <button
                    onClick={() => {
                      trackWatchlistToggle({ symbol: decodedSymbol, action: isInWatchlist ? 'remove' : 'add' });
                      toggle(decodedSymbol);
                    }}
                    className="text-amber-400 hover:scale-110 transition-transform"
                    title={isInWatchlist ? t('stockDetail.removeFromWatchlist') : t('stockDetail.addToWatchlist')}
                  >
                    <Star className={`w-6 h-6 ${isInWatchlist ? 'fill-current' : ''}`} />
                  </button>
                </div>
                <p className="text-black/50 dark:text-white/50">{stock.name}</p>
              </div>
              <div className="text-right">
                <div className="text-3xl font-mono font-bold text-black dark:text-white">
                  {formatPrice(stock.price, stock.currency)}
                </div>
                <PriceChange
                  change={stock.change}
                  percent={stock.changePercent}
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
                  onClick={() => {
                    setSelectedRange(range.value);
                    trackChartRangeChanged({ symbol: decodedSymbol, range: range.value });
                  }}
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
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.open')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.open ? formatPrice(stock.open, stock.currency) : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.previousClose')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.previousClose ? formatPrice(stock.previousClose, stock.currency) : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.dailyRange')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.dayLow && stock.dayHigh
                  ? `${stock.dayLow.toFixed(2)} - ${stock.dayHigh.toFixed(2)}`
                  : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.volume')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.volume ? formatVolume(stock.volume) : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.fiftyTwoWeekRange')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.fiftyTwoWeekLow && stock.fiftyTwoWeekHigh
                  ? `${stock.fiftyTwoWeekLow.toFixed(2)} - ${stock.fiftyTwoWeekHigh.toFixed(2)}`
                  : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.marketCap')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.marketCap ? formatMarketCap(stock.marketCap) : '-'}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.exchange')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.exchange}
              </div>
            </div>
            <div className="p-4 rounded-lg bg-black/[0.02] dark:bg-white/[0.02] border border-black/5 dark:border-white/5">
              <div className="text-xs text-black/50 dark:text-white/50 mb-1">{t('stockDetail.currency')}</div>
              <div className="font-mono font-medium text-black dark:text-white">
                {stock.currency}
              </div>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
