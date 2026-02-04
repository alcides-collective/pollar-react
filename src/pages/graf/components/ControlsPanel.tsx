import { motion } from 'framer-motion';
import { useGrafStore } from '@/stores/grafStore';
import type { ConnectionType, VisualizationMode } from '@/types/graph';
import { CONNECTION_CONFIGS } from '@/types/graph';

const MODES: { value: VisualizationMode; label: string }[] = [
  { value: 'force', label: 'Siły' },
  { value: 'radial', label: 'Promieniowy' },
  { value: 'hierarchical', label: 'Hierarchia' },
  { value: 'timeline', label: 'Oś czasu' },
];

export function ControlsPanel() {
  const mode = useGrafStore((s) => s.mode);
  const setMode = useGrafStore((s) => s.setMode);
  const enabledConnections = useGrafStore((s) => s.enabledConnections);
  const toggleConnection = useGrafStore((s) => s.toggleConnection);
  const minTrendingScore = useGrafStore((s) => s.minTrendingScore);
  const setMinTrendingScore = useGrafStore((s) => s.setMinTrendingScore);
  const resetFilters = useGrafStore((s) => s.resetFilters);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="graf-controls"
    >
      {/* Mode Switcher */}
      <div className="graf-controls-section">
        <h3 className="graf-controls-title">Tryb wizualizacji</h3>
        <div className="graf-mode-buttons">
          {MODES.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => setMode(value)}
              className={`graf-mode-button ${mode === value ? 'active' : ''}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Connection Toggles */}
      <div className="graf-controls-section">
        <h3 className="graf-controls-title">Typy połączeń</h3>
        <div className="graf-connection-toggles">
          {(Object.keys(CONNECTION_CONFIGS) as ConnectionType[]).map((type) => (
            <label key={type} className="graf-toggle">
              <input
                type="checkbox"
                checked={enabledConnections[type]}
                onChange={() => toggleConnection(type)}
              />
              <span
                className="graf-toggle-indicator"
                style={{
                  backgroundColor: enabledConnections[type]
                    ? CONNECTION_CONFIGS[type].color
                    : '#27272a',
                }}
              >
                <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              <span className="graf-toggle-label">{CONNECTION_CONFIGS[type].label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Trending Score Filter */}
      <div className="graf-controls-section">
        <h3 className="graf-controls-title">Min. trending score</h3>
        <div className="graf-slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={minTrendingScore}
            onChange={(e) => setMinTrendingScore(Number(e.target.value))}
            className="graf-slider"
          />
          <span className="graf-slider-value">{minTrendingScore}</span>
        </div>
      </div>

      {/* Reset Button */}
      <button onClick={resetFilters} className="graf-reset-button">
        Resetuj filtry
      </button>
    </motion.div>
  );
}
