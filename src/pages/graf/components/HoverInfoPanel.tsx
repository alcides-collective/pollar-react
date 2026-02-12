import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CONNECTION_CONFIGS } from '@/types/graph';
import type { ConnectionType, GraphNode } from '@/types/graph';

interface ConnectionStat {
  type: ConnectionType;
  count: number;
  totalStrength: number;
  maxStrength: number;
  items: { name: string; count: number }[];
}

interface HoverInfoPanelProps {
  node: GraphNode;
  neighborCount: number;
  connections: ConnectionStat[];
}

const TYPE_ICONS: Record<ConnectionType, string> = {
  people: 'ri-user-line',
  countries: 'ri-globe-line',
  sources: 'ri-newspaper-line',
  category: 'ri-price-tag-3-line',
};

export function HoverInfoPanel({
  node,
  neighborCount,
  connections,
}: HoverInfoPanelProps) {
  const sorted = useMemo(
    () => [...connections].sort((a, b) => b.totalStrength - a.totalStrength),
    [connections]
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.15 }}
      className="graf-hover-panel"
    >
      {/* Header */}
      <div className="graf-hover-header">
        <span
          className="graf-hover-dot"
          style={{ backgroundColor: node.color }}
        />
        <span className="graf-hover-label">{node.label}</span>
        <span className="graf-hover-meta">
          {neighborCount} {neighborCount === 1 ? 'połączenie' : neighborCount < 5 ? 'połączenia' : 'połączeń'}
        </span>
      </div>

      {/* Connection groups */}
      {sorted.length > 0 ? (
        <div className="graf-hover-connections">
          {sorted.map((conn) => {
            const config = CONNECTION_CONFIGS[conn.type];
            const strengthRatio = conn.totalStrength / (conn.maxStrength * conn.count);

            return (
              <div key={conn.type} className="graf-hover-conn">
                <div className="graf-hover-conn-header">
                  <i
                    className={TYPE_ICONS[conn.type]}
                    style={{ color: config.color }}
                  />
                  <span className="graf-hover-conn-label">
                    {config.label}
                  </span>
                  <span className="graf-hover-conn-count">{conn.count}x</span>
                  <div className="graf-hover-strength-bar">
                    <div
                      className="graf-hover-strength-fill"
                      style={{
                        width: `${Math.round(strengthRatio * 100)}%`,
                        backgroundColor: config.color,
                      }}
                    />
                  </div>
                </div>
                {conn.items.length > 0 && (
                  <div className="graf-hover-items">
                    {conn.items.slice(0, 5).map((item) => (
                      <span key={item.name} className="graf-hover-item">
                        {item.name}
                        {item.count > 1 && (
                          <span className="graf-hover-item-count">
                            {item.count}
                          </span>
                        )}
                      </span>
                    ))}
                    {conn.items.length > 5 && (
                      <span className="graf-hover-item-more">
                        +{conn.items.length - 5}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="graf-hover-empty">Brak połączeń</div>
      )}
    </motion.div>
  );
}
