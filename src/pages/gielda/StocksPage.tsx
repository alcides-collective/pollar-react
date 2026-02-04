import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useGieldaData } from '../../hooks/useGieldaData';
import { StockCard } from '../../components/gielda';
import { Skeleton } from '../../components/ui/skeleton';
import { Search } from 'lucide-react';

export function StocksPage() {
  const { t } = useTranslation('gielda');
  const { stocks, loading } = useGieldaData();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'symbol' | 'change' | 'volume'>('symbol');

  const filteredStocks = stocks
    .filter(stock => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        stock.symbol.toLowerCase().includes(query) ||
        stock.name.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'change':
          return b.changePercent - a.changePercent;
        case 'volume':
          return b.volume - a.volume;
        default:
          return a.symbol.localeCompare(b.symbol);
      }
    });

  return (
    <div className="stocks-page">
      <header className="page-header mb-6">
        <h1 className="text-2xl font-semibold text-black dark:text-white mb-1">{t('stocksPage.title')}</h1>
        <p className="text-sm text-black/50 dark:text-white/50">
          {t('stocksPage.subtitle')}
        </p>
      </header>

      {/* Filters */}
      <div className="filters mb-6 flex flex-wrap gap-4 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-black/40 dark:text-white/40" />
          <input
            type="text"
            placeholder={t('stocksPage.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-sm focus:outline-none focus:ring-2 focus:ring-black/10 dark:focus:ring-white/10"
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'symbol' | 'change' | 'volume')}
          className="h-10 px-4 rounded-lg border border-black/10 dark:border-white/10 bg-white dark:bg-neutral-900 text-sm focus:outline-none"
        >
          <option value="symbol">{t('stocksPage.sortSymbol')}</option>
          <option value="change">{t('stocksPage.sortChange')}</option>
          <option value="volume">{t('stocksPage.sortVolume')}</option>
        </select>
      </div>

      {loading && stocks.length === 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <Skeleton key={i} className="h-32 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <>
          <p className="text-xs text-black/40 dark:text-white/40 mb-4">
            {t('stocksPage.found', { count: filteredStocks.length })}
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredStocks.map(stock => (
              <StockCard key={stock.symbol} stock={stock} />
            ))}
          </div>
          {filteredStocks.length === 0 && (
            <div className="text-center py-12 text-black/40 dark:text-white/40">
              {t('stocksPage.noResults')}
            </div>
          )}
        </>
      )}
    </div>
  );
}
