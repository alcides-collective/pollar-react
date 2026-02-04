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
      <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center gap-2">
        <LocalizedLink to="/gielda" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors shrink-0">
          Notowania
        </LocalizedLink>
        <div className="text-sm text-zinc-400">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center gap-2">
      <LocalizedLink to="/gielda" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors shrink-0">
        Notowania
      </LocalizedLink>

      <div ref={scrollRef} className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
        {indices.map((item) => {
          const isPositive = item.changePercent >= 0;
          return (
            <div
              key={item.symbol}
              className={`flex items-center gap-2 px-3 py-1 rounded text-sm whitespace-nowrap ${
                isPositive ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
              }`}
            >
              <span className="text-zinc-700">{item.name}</span>
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
            </div>
          );
        })}
      </div>

      <div className="flex items-center shrink-0 ml-auto">
        <button onClick={() => scroll('left')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
          <i className="ri-arrow-left-s-line text-lg" />
        </button>
        <button onClick={() => scroll('right')} className="text-zinc-400 hover:text-zinc-900 transition-colors">
          <i className="ri-arrow-right-s-line text-lg" />
        </button>
      </div>
    </div>
  );
}
