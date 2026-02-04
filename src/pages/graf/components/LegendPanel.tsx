import { motion } from 'framer-motion';
import { CATEGORY_COLORS, CONNECTION_CONFIGS } from '@/types/graph';
import type { ConnectionType } from '@/types/graph';

export function LegendPanel() {
  const categories = Object.entries(CATEGORY_COLORS).filter(([key]) => key !== 'default');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="graf-legend"
    >
      {/* Category Colors */}
      <div className="graf-legend-section">
        <h4 className="graf-legend-title">Kategorie</h4>
        <div className="graf-legend-items">
          {categories.map(([key, color]) => (
            <div key={key} className="graf-legend-item">
              <span className="graf-legend-dot" style={{ backgroundColor: color }} />
              <span className="graf-legend-label">{key}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Connection Types */}
      <div className="graf-legend-section">
        <h4 className="graf-legend-title">Połączenia</h4>
        <div className="graf-legend-items">
          {(Object.keys(CONNECTION_CONFIGS) as ConnectionType[]).map((type) => (
            <div key={type} className="graf-legend-item">
              <span
                className="graf-legend-line"
                style={{ backgroundColor: CONNECTION_CONFIGS[type].color }}
              />
              <span className="graf-legend-label">{CONNECTION_CONFIGS[type].label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Size Legend */}
      <div className="graf-legend-section">
        <h4 className="graf-legend-title">Rozmiar węzła</h4>
        <div className="graf-legend-size">
          <div className="graf-legend-size-item">
            <span className="graf-legend-dot-small" />
            <span>Niski trending</span>
          </div>
          <div className="graf-legend-size-item">
            <span className="graf-legend-dot-large" />
            <span>Wysoki trending</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
