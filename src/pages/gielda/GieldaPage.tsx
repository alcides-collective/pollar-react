import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useGieldaData } from '../../hooks/useGieldaData';
import { IndexCard, StockCard, PriceChange } from '../../components/gielda';
import { getStockDisplaySymbol } from '../../types/gielda';
import { Skeleton } from '../../components/ui/skeleton';

function formatRelativeTime(timestamp: number, currentTime: number): string {
  const diff = Math.floor((currentTime - timestamp) / 1000);

  if (diff < 5) return 'teraz';
  if (diff < 60) return `${diff} sek. temu`;

  const minutes = Math.floor(diff / 60);
  if (minutes < 60) return `${minutes} min. temu`;

  const hours = Math.floor(minutes / 60);
  return `${hours} godz. temu`;
}

export function GieldaPage() {
  const {
    stocks,
    loading,
    error,
    topGainers,
    topLosers,
    polishIndices,
    globalIndices,
  } = useGieldaData();

  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const lastUpdateFormatted = stocks.length > 0 ? formatRelativeTime(Date.now(), now) : null;

  if (error) {
    return (
      <div className="gielda-dashboard">
        <header className="page-header mb-6">
          <h1 className="text-2xl font-semibold text-black dark:text-white">Giełda</h1>
        </header>
        <div className="rounded-lg p-4 border border-red-600/20 bg-red-600/5 text-red-700 dark:text-red-400">
          <p className="font-medium">Nie udało się załadować danych giełdowych.</p>
          <p className="text-sm mt-2 opacity-70">
            Spróbuj odświeżyć stronę. Jeśli problem się powtarza, skontaktuj się z nami.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="gielda-dashboard">
      {/* Header */}
      <header className="page-header mb-6">
        <div className="flex items-baseline gap-3 mb-1">
          <h1 className="text-2xl font-semibold text-black dark:text-white">Giełda</h1>
          {lastUpdateFormatted && (
            <span className="text-xs text-black/40 dark:text-white/40 font-mono">
              aktualizacja: {lastUpdateFormatted}
            </span>
          )}
        </div>
        <p className="text-sm text-black/50 dark:text-white/50">
          Notowania akcji i indeksów w czasie rzeczywistym
        </p>
      </header>

      {loading && stocks.length === 0 ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            <div className="space-y-4">
              <Skeleton className="h-40 w-full rounded-lg" />
              <Skeleton className="h-40 w-full rounded-lg" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-48 w-full rounded-lg" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
            {/* Left Column: Indices */}
            <section className="indices-section">
              {/* Polish Indices */}
              <div className="section-block mb-6 p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60 mb-4">
                  Indeksy Polskie
                </h2>
                <div className="grid gap-3">
                  {polishIndices.map(index => (
                    <IndexCard key={index.symbol} index={index} large />
                  ))}
                </div>
              </div>

              {/* Global Indices */}
              <div className="section-block p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60 mb-4">
                  Indeksy Globalne
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {globalIndices.map(index => (
                    <IndexCard key={index.symbol} index={index} />
                  ))}
                </div>
              </div>
            </section>

            {/* Right Column: Top Movers */}
            <aside className="movers-section">
              {/* Top Gainers */}
              <div className="section-block mb-6 p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-green-600 dark:text-green-400 mb-4">
                  <span className="mr-2">↑</span> Wzrosty
                </h2>
                <div className="space-y-2">
                  {topGainers.map((stock, i) => (
                    <Link
                      key={stock.symbol}
                      to={`/gielda/akcje/${encodeURIComponent(stock.symbol)}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-green-600/50 dark:text-green-400/50 font-mono w-4">
                          {i + 1}.
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-black dark:text-white">
                            {getStockDisplaySymbol(stock.symbol)}
                          </span>
                          <span className="text-xs text-black/50 dark:text-white/50 ml-2 font-mono">
                            {stock.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <PriceChange
                        change={stock.change}
                        percent={stock.changePercent}
                        size="sm"
                        showArrow={false}
                      />
                    </Link>
                  ))}
                  {topGainers.length === 0 && (
                    <p className="text-sm text-black/40 dark:text-white/40 text-center py-4">
                      Brak danych
                    </p>
                  )}
                </div>
              </div>

              {/* Top Losers */}
              <div className="section-block p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-red-600 dark:text-red-400 mb-4">
                  <span className="mr-2">↓</span> Spadki
                </h2>
                <div className="space-y-2">
                  {topLosers.map((stock, i) => (
                    <Link
                      key={stock.symbol}
                      to={`/gielda/akcje/${encodeURIComponent(stock.symbol)}`}
                      className="flex items-center justify-between p-3 rounded-lg bg-red-500/5 border border-red-500/10 hover:bg-red-500/10 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-red-600/50 dark:text-red-400/50 font-mono w-4">
                          {i + 1}.
                        </span>
                        <div>
                          <span className="text-sm font-semibold text-black dark:text-white">
                            {getStockDisplaySymbol(stock.symbol)}
                          </span>
                          <span className="text-xs text-black/50 dark:text-white/50 ml-2 font-mono">
                            {stock.price.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <PriceChange
                        change={stock.change}
                        percent={stock.changePercent}
                        size="sm"
                        showArrow={false}
                      />
                    </Link>
                  ))}
                  {topLosers.length === 0 && (
                    <p className="text-sm text-black/40 dark:text-white/40 text-center py-4">
                      Brak danych
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>

          {/* All WIG20 Stocks */}
          <section className="stocks-section mt-8">
            <div className="section-block p-5 bg-black/[0.02] dark:bg-white/[0.02] rounded-xl border border-black/5 dark:border-white/5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-black/60 dark:text-white/60">
                  Akcje WIG20
                </h2>
                <Link
                  to="/gielda/akcje"
                  className="text-xs text-black/50 dark:text-white/50 hover:text-black dark:hover:text-white transition-colors"
                >
                  Zobacz wszystkie →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {stocks.slice(0, 12).map(stock => (
                  <StockCard key={stock.symbol} stock={stock} compact />
                ))}
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
