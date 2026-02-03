import { Link } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { PriceChange } from './PriceChange';
import type { IndexData } from '../../types/gielda';
import { getStockDisplaySymbol } from '../../types/gielda';

interface IndexCardProps {
  index: IndexData;
  large?: boolean;
  className?: string;
}

export function IndexCard({ index, large = false, className }: IndexCardProps) {
  const displaySymbol = getStockDisplaySymbol(index.symbol);
  const isPositive = index.change >= 0;

  return (
    <Link
      to={`/gielda/indeksy/${encodeURIComponent(index.symbol)}`}
      className={cn(
        'group block rounded-lg border transition-all duration-200 hover:-translate-y-0.5',
        large ? 'p-5' : 'p-4',
        isPositive
          ? 'border-green-500/20 bg-green-500/5 hover:border-green-500/40'
          : 'border-red-500/20 bg-red-500/5 hover:border-red-500/40',
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <span
            className={cn(
              'font-semibold text-black dark:text-white',
              large ? 'text-base' : 'text-sm'
            )}
          >
            {index.name}
          </span>
          <span className="ml-1 text-xs text-black/40 dark:text-white/40">
            {displaySymbol}
          </span>
        </div>
        <PriceChange
          change={index.change}
          percent={index.changePercent}
          size={large ? 'md' : 'sm'}
        />
      </div>

      <div className="mt-3">
        <span
          className={cn(
            'font-mono font-bold',
            large ? 'text-2xl' : 'text-xl',
            isPositive
              ? 'text-green-700 dark:text-green-400'
              : 'text-red-700 dark:text-red-400'
          )}
        >
          {index.value.toLocaleString('pl-PL', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </span>
      </div>

      {large && index.previousClose && (
        <div className="mt-2 text-xs font-mono text-black/50 dark:text-white/50">
          Poprzednie zamknięcie:{' '}
          {index.previousClose.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}
        </div>
      )}
    </Link>
  );
}
