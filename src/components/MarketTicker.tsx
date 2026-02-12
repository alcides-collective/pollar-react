import { useRef, useState, useEffect } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { motion, AnimatePresence } from 'framer-motion';
import { useMarketData } from '../hooks/useMarketData';

interface AnimatedValueProps {
  value: number;
  format: (n: number) => string;
}

function AnimatedValue({ value, format }: AnimatedValueProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const [direction, setDirection] = useState<'up' | 'down' | null>(null);
  const [key, setKey] = useState(0);

  useEffect(() => {
    if (value !== displayValue) {
      setDirection(value > displayValue ? 'up' : 'down');
      setDisplayValue(value);
      setKey(k => k + 1);
    }
  }, [value, displayValue]);

  const variants = {
    enter: (dir: 'up' | 'down' | null) => ({
      y: dir === 'up' ? 20 : dir === 'down' ? -20 : 0,
      opacity: 0,
    }),
    center: {
      y: 0,
      opacity: 1,
    },
    exit: (dir: 'up' | 'down' | null) => ({
      y: dir === 'up' ? -20 : dir === 'down' ? 20 : 0,
      opacity: 0,
    }),
  };

  return (
    <span className="relative inline-flex overflow-hidden h-[1.2em] items-center">
      <AnimatePresence mode="popLayout" custom={direction}>
        <motion.span
          key={key}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="font-medium"
        >
          {format(displayValue)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

export function MarketTicker() {
  const { indices, loading } = useMarketData();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const scrollAmount = 200;
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (loading && indices.length === 0) {
    return (
      <div className="bg-surface border-b border-divider px-4 py-2 flex items-center gap-2 min-h-[40px]">
        <LocalizedLink to="/gielda" className="text-sm text-content-subtle hover:text-content-heading transition-colors shrink-0">
          Notowania
        </LocalizedLink>
        <div className="flex items-center gap-3 flex-1">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-6 w-24 bg-content-faint/10 rounded animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border-b border-divider px-4 py-2 flex items-center gap-2 min-h-[40px]">
      <LocalizedLink to="/gielda" className="text-sm text-content-subtle hover:text-content-heading transition-colors shrink-0">
        Notowania
      </LocalizedLink>

      <div ref={scrollRef} className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {indices.map((item) => {
          const isPositive = item.changePercent >= 0;
          return (
            <LocalizedLink
              key={item.symbol}
              to={`/gielda/indeksy/${encodeURIComponent(item.symbol)}`}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm whitespace-nowrap transition-colors duration-500 ${
                isPositive
                  ? 'bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/40 hover:text-green-700 dark:hover:text-green-300'
                  : 'bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/40 hover:text-red-700 dark:hover:text-red-300'
              }`}
            >
              <span className="text-content">{item.name}</span>
              <AnimatedValue
                value={item.value}
                format={(n) => n.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              />
              <span className="flex items-center gap-0.5">
                <i className={isPositive ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill'} />
                <AnimatedValue
                  value={Math.abs(item.changePercent)}
                  format={(n) => `${n.toFixed(2)}%`}
                />
              </span>
            </LocalizedLink>
          );
        })}
      </div>

      <div className="flex items-center shrink-0 ml-auto">
        <button onClick={() => scroll('left')} className="text-content-faint hover:text-content-heading transition-colors">
          <i className="ri-arrow-left-s-line text-lg" />
        </button>
        <button onClick={() => scroll('right')} className="text-content-faint hover:text-content-heading transition-colors">
          <i className="ri-arrow-right-s-line text-lg" />
        </button>
      </div>
    </div>
  );
}
