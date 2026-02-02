import { Outlet } from 'react-router-dom';
import { DaneNav } from '@/components/dane';

export function DaneLayout() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-[1400px]">
      <div className="lg:grid lg:grid-cols-[220px_1fr] lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block sticky top-24 h-fit">
          <DaneNav />
        </aside>

        {/* Mobile nav */}
        <div className="lg:hidden mb-6 overflow-x-auto scrollbar-hide">
          <DaneNav mobile />
        </div>

        {/* Content */}
        <main className="min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
