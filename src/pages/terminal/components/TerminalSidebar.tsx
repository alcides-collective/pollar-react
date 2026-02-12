import { useTranslation } from 'react-i18next';
import type { Event } from '../../../types/events';
import type { IndexData } from '../../../hooks/useMarketData';
import { TerminalMap } from './TerminalMap';

interface TerminalSidebarProps {
  indices: IndexData[];
  categories: { name: string; count: number }[];
  event: Event | null;
  focused: boolean;
}

export function TerminalSidebar({
  indices,
  categories,
  event,
  focused
}: TerminalSidebarProps) {
  const { t } = useTranslation('terminal');

  return (
    <aside className={`panel sidebar-panel ${focused ? 'focused' : ''}`}>
      {/* Market Indicators */}
      <div className="sidebar-section">
        <div className="section-header">{t('sidebar.quotes').toUpperCase()}</div>
        <div className="indicators-grid">
          {indices.length > 0 ? (
            indices.slice(0, 8).map(index => (
              <div key={`${index.symbol}-${index.changePercent}`} className="indicator">
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
        <div className="section-header">{t('sidebar.categories').toUpperCase()}</div>
        <div className="categories-list">
          {categories.map(({ name, count }) => (
            <div key={name} className="category-row">
              <span className="category-name">{t(`categories.${name}`, { defaultValue: name }).toUpperCase()}</span>
              <span className="category-count">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Map */}
      <div className="sidebar-section map-section">
        <div className="section-header">{t('sidebar.map').toUpperCase()}</div>
        <div className="map-container">
          <TerminalMap event={event} />
        </div>
      </div>
    </aside>
  );
}
