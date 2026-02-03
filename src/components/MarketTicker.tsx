import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { useMarketData } from '../hooks/useMarketData';

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
        <Link to="/gielda" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors shrink-0">
          Notowania
        </Link>
        <div className="text-sm text-zinc-400">Ładowanie...</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 flex items-center gap-2">
      <Link to="/gielda" className="text-sm text-zinc-500 hover:text-zinc-900 transition-colors shrink-0">
        Notowania
      </Link>

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
              <span className="font-medium">{item.value.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span className="flex items-center gap-0.5">
                <i className={isPositive ? 'ri-arrow-up-s-fill' : 'ri-arrow-down-s-fill'} />
                {Math.abs(item.changePercent).toFixed(2)}%
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
