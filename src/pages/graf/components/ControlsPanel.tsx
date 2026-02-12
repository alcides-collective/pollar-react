import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { useGrafStore } from '@/stores/grafStore';
import type { ConnectionType, VisualizationMode } from '@/types/graph';
import { CONNECTION_CONFIGS } from '@/types/graph';

const MODE_KEYS: VisualizationMode[] = ['force', 'radial', 'hierarchical', 'timeline'];

interface ControlsPanelProps {
  maxTrendingScore: number;
}

export function ControlsPanel({ maxTrendingScore }: ControlsPanelProps) {
  const { t } = useTranslation('graf');
  const mode = useGrafStore((s) => s.mode);
  const setMode = useGrafStore((s) => s.setMode);
  const enabledConnections = useGrafStore((s) => s.enabledConnections);
  const toggleConnection = useGrafStore((s) => s.toggleConnection);
  const minTrendingScore = useGrafStore((s) => s.minTrendingScore);
  const setMinTrendingScore = useGrafStore((s) => s.setMinTrendingScore);
  const resetFilters = useGrafStore((s) => s.resetFilters);
  const toggleControls = useGrafStore((s) => s.toggleControls);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.2 }}
      className="graf-controls"
    >
      <div className="graf-panel-header">
        <h2 className="graf-panel-title">{t('controls.title', 'Kontrolki')}</h2>
        <button onClick={toggleControls} className="graf-panel-close" aria-label="Zamknij">
          <i className="ri-close-line" />
        </button>
      </div>
      {/* Mode Switcher */}
      <div className="graf-controls-section">
        <h3 className="graf-controls-title">{t('controls.visualizationMode')}</h3>
        <div className="graf-mode-buttons">
          {MODE_KEYS.map((modeKey) => (
            <button
              key={modeKey}
              onClick={() => setMode(modeKey)}
              className={`graf-mode-button ${mode === modeKey ? 'active' : ''}`}
            >
              {t(`modes.${modeKey}`)}
            </button>
          ))}
        </div>
      </div>

      {/* Connection Toggles */}
      <div className="graf-controls-section">
        <h3 className="graf-controls-title">{t('controls.connectionTypes')}</h3>
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
              <span className="graf-toggle-label">{t(`connections.${type}`)}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Trending Score Filter */}
      <div className="graf-controls-section">
        <h3 className="graf-controls-title">{t('controls.minTrendingScore')}</h3>
        <div className="graf-slider-container">
          <input
            type="range"
            min="0"
            max={maxTrendingScore}
            value={minTrendingScore}
            onChange={(e) => setMinTrendingScore(Number(e.target.value))}
            className="graf-slider"
          />
          <span className="graf-slider-value">{minTrendingScore}</span>
          {minTrendingScore < maxTrendingScore * 0.25 && (
            <span className="graf-slider-warning">
              <i className="ri-alert-line" /> Wiele wydarzeń może obniżać wydajność
            </span>
          )}
        </div>
      </div>

      {/* Reset Button */}
      <button onClick={resetFilters} className="graf-reset-button">
        {t('controls.resetFilters')}
      </button>
    </motion.div>
  );
}
