import { cn } from '../../lib/utils';

interface PriceChangeProps {
  change: number;
  percent: number;
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  showArrow?: boolean;
  className?: string;
}

export function PriceChange({
  change,
  percent,
  size = 'md',
  showValue = false,
  showArrow = true,
  className,
}: PriceChangeProps) {
  const isPositive = change >= 0;
  const isNeutral = change === 0;

  const colorClass = isNeutral
    ? 'text-gray-500 dark:text-gray-400'
    : isPositive
      ? 'text-green-600 dark:text-green-400'
      : 'text-red-600 dark:text-red-400';

  const bgClass = isNeutral
    ? 'bg-gray-500/10'
    : isPositive
      ? 'bg-green-500/10'
      : 'bg-red-500/10';

  const sizeClass = {
    sm: 'text-[10px] px-1.5 py-0.5',
    md: 'text-xs px-2 py-1',
    lg: 'text-sm px-3 py-1.5',
  }[size];

  const arrow = isNeutral ? '−' : isPositive ? '↑' : '↓';
  const sign = isPositive ? '+' : '';

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-sm font-mono font-medium whitespace-nowrap',
        colorClass,
        bgClass,
        sizeClass,
        className
      )}
    >
      {showArrow && <span className="text-[0.9em]">{arrow}</span>}
      {showValue && (
        <>
          <span>{sign}{change.toFixed(2)}</span>
          <span className="opacity-50">/</span>
        </>
      )}
      <span>{sign}{percent.toFixed(2)}%</span>
    </span>
  );
}
