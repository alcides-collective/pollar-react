import { Outlet } from 'react-router-dom';
import { SejmNav } from '../../components/sejm/SejmNav';

export function SejmLayout() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1400px] mx-auto px-4 lg:px-6 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar Navigation */}
          <aside className="lg:w-[200px] lg:shrink-0">
            <div className="lg:sticky lg:top-24">
              <SejmNav />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
