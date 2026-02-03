import { Outlet } from 'react-router-dom';
import { GieldaNav } from '../../components/gielda';
import { MarketTicker } from '../../components/MarketTicker';

export function GieldaLayout() {
  return (
    <section className="max-w-[1400px] mx-auto px-0 lg:px-6 pb-10 -mt-3">
      <div className="border border-zinc-200 dark:border-zinc-800">
        {/* Market Ticker - inline, część contentu */}
        <MarketTicker />

        <div className="flex flex-col lg:flex-row">
          {/* Left Sidebar Navigation */}
          <aside className="lg:w-[200px] lg:flex-shrink-0 lg:border-r border-zinc-200 dark:border-zinc-800 p-4 lg:py-6">
            <div className="lg:sticky lg:top-[100px]">
              <GieldaNav />
            </div>
          </aside>

          {/* Page content */}
          <div className="flex-1 min-w-0 min-h-[80vh] p-4 lg:p-6">
            <Outlet />
          </div>
        </div>
      </div>
    </section>
  );
}
