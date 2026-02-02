import type { Event } from '../../../types/events';
import type { IndexData } from '../../../hooks/useMarketData';
import { TerminalMap } from './TerminalMap';

interface TerminalSidebarProps {
  indices: IndexData[];
  categories: { name: string; count: number }[];
  event: Event | null;
  focused: boolean;
}

// Category translation (simplified)
function translateCategory(category: string): string {
  const translations: Record<string, string> = {
    'News': 'AKTUALNOSCI',
    'Politics': 'POLITYKA',
    'Business': 'BIZNES',
    'Economy': 'EKONOMIA',
    'Technology': 'TECHNOLOGIA',
    'Science': 'NAUKA',
    'Health': 'ZDROWIE',
    'Sports': 'SPORT',
    'Entertainment': 'ROZRYWKA',
    'World': 'SWIAT',
    'Poland': 'POLSKA',
    'Culture': 'KULTURA',
    'Society': 'SPOLECZENSTWO',
  };
  return translations[category] || category.toUpperCase();
}

export function TerminalSidebar({
  indices,
  categories,
  event,
  focused
}: TerminalSidebarProps) {
  return (
    <aside className={`panel sidebar-panel ${focused ? 'focused' : ''}`}>
      {/* Market Indicators */}
      <div className="sidebar-section">
        <div className="section-header">NOTOWANIA</div>
        <div className="indicators-grid">
          {indices.length > 0 ? (
            indices.slice(0, 8).map(index => (
              <div key={index.symbol} className="indicator">
                <span className="indicator-code">{index.name}</span>
                <span className={`indicator-value ${
                  index.changePercent > 0 ? 'positive' :
                  index.changePercent < 0 ? 'negative' : 'neutral'
                }`}>
                  {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                </span>
              </div>
            ))
          ) : (
            <div className="indicator">
              <span className="indicator-code">---</span>
              <span className="indicator-value neutral">-.--</span>
            </div>
          )}
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="sidebar-section categories-section">
        <div className="section-header">KATEGORIE</div>
        <div className="categories-list">
          {categories.map(({ name, count }) => (
            <div key={name} className="category-row">
              <span className="category-name">{translateCategory(name)}</span>
              <span className="category-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="sidebar-section map-section">
        <div className="section-header">MAPA</div>
        <div className="map-container">
          <TerminalMap event={event} />
        </div>
      </div>
    </aside>
  );
}
