import { useTranslation } from 'react-i18next';
import { useGieldaData } from '../../hooks/useGieldaData';
import { useWatchlistStore } from '../../stores/gieldaStore';
import { StockCard } from '../../components/gielda';
import { Skeleton } from '../../components/ui/skeleton';
import { Star } from 'lucide-react';

export function WatchlistPage() {
  const { t } = useTranslation('gielda');
  const { stocks, loading } = useGieldaData();
  const { items, clear } = useWatchlistStore();

  const watchlistStocks = stocks.filter(stock =>
    items.some(item => item.symbol === stock.symbol)
  );

  return (
    <div className="watchlist-page">
      <header className="page-header mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-black dark:text-white mb-1">
              {t('watchlistPage.title')}
            </h1>
            <p className="text-sm text-black/50 dark:text-white/50">
              {t('watchlistPage.subtitle')}
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clear}
              className="text-xs text-red-600 dark:text-red-400 hover:underline"
            >
              {t('watchlistPage.clearList')}
            </button>
          )}
        </div>
      </header>

      {loading && stocks.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="empty-state text-center py-16">
          <Star className="w-12 h-12 text-amber-400/50 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-black dark:text-white mb-2">
            {t('watchlistPage.emptyTitle')}
          </h2>
          <p className="text-sm text-black/50 dark:text-white/50 max-w-md mx-auto">
            {t('watchlistPage.emptyDescription')}
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-black/40 dark:text-white/40 mb-4">
            {t('watchlistPage.stocksOnList', { count: watchlistStocks.length })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {watchlistStocks.map(stock => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
          {watchlistStocks.length === 0 && items.length > 0 && (
            <div className="text-center py-12 text-black/40 dark:text-white/40">
              {t('watchlistPage.loadingWatchlist')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
