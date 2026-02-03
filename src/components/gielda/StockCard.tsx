import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { PriceChange } from './PriceChange';
import { useWatchlistStore } from '../../stores/gieldaStore';
import type { Stock } from '../../types/gielda';
import { getStockDisplaySymbol, formatPrice } from '../../types/gielda';

interface StockCardProps {
  stock: Stock;
  showWatchlist?: boolean;
  compact?: boolean;
  className?: string;
}

export function StockCard({
  stock,
  showWatchlist = true,
  compact = false,
  className,
}: StockCardProps) {
  const displaySymbol = getStockDisplaySymbol(stock.symbol);
  const { items, toggle } = useWatchlistStore();
  const isInWatchlist = items.some(w => w.symbol === stock.symbol);

  const handleToggleWatchlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(stock.symbol);
  };

  return (
    <Link
      to={`/gielda/akcje/${encodeURIComponent(stock.symbol)}`}
      className={cn(
        'group block rounded-lg border border-black/10 dark:border-white/10',
        'hover:border-black/20 dark:hover:border-white/20',
        'bg-white dark:bg-neutral-900/50',
        'transition-all duration-200 hover:-translate-y-px hover:shadow-md dark:hover:shadow-black/30',
        compact ? 'p-3' : 'p-4',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-black dark:text-white">
              {displaySymbol}
            </span>
            {showWatchlist && (
              <button
                onClick={handleToggleWatchlist}
                className="text-xs text-amber-400 opacity-0 transition-all group-hover:opacity-100 hover:scale-110"
                title={isInWatchlist ? 'Usuń z obserwowanych' : 'Dodaj do obserwowanych'}
              >
                {isInWatchlist ? '★' : '☆'}
              </button>
            )}
          </div>
          {!compact && (
            <p className="mt-0.5 truncate text-xs text-black/50 dark:text-white/50">
              {stock.name}
            </p>
          )}
        </div>
        <PriceChange change={stock.change} percent={stock.changePercent} size="sm" />
      </div>

      <div className="mt-3 flex items-end justify-between">
        <span className="font-mono text-lg font-bold text-black dark:text-white">
          {formatPrice(stock.price, stock.currency)}
        </span>
        {!compact && stock.volume > 0 && (
          <span className="font-mono text-[10px] text-black/40 dark:text-white/40">
            Vol: {(stock.volume / 1000).toFixed(0)}k
          </span>
        )}
      </div>

      {!compact && (
        <div className="mt-2 flex items-center gap-3 font-mono text-[10px] text-black/40 dark:text-white/40">
          {stock.dayHigh && stock.dayLow && (
            <>
              <span>H: {stock.dayHigh.toFixed(2)}</span>
              <span>L: {stock.dayLow.toFixed(2)}</span>
            </>
          )}
        </div>
      )}
    </Link>
  );
}
