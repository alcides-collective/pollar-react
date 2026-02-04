import { motion } from 'framer-motion';
import type { GraphNode } from '@/types/graph';

interface EventDetailsPanelProps {
  node: GraphNode;
  onClose: () => void;
  onNavigate: () => void;
}

export function EventDetailsPanel({ node, onClose, onNavigate }: EventDetailsPanelProps) {
  const { event } = node;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.2 }}
      className="graf-details"
    >
      <div className="graf-details-header">
        <span className="graf-details-category" style={{ color: node.color }}>
          {event.category}
        </span>
        <button onClick={onClose} className="graf-details-close" aria-label="Zamknij">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path
              d="M15 5L5 15M5 5L15 15"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <h2 className="graf-details-title">{event.title}</h2>

      {event.metadata?.shortHeadline && (
        <p className="graf-details-lead">{event.metadata.shortHeadline}</p>
      )}

      {/* Mentioned People */}
      {event.metadata?.mentionedPeople && event.metadata.mentionedPeople.length > 0 && (
        <div className="graf-details-section">
          <h4 className="graf-details-section-title">Wspomniane osoby</h4>
          <div className="graf-details-tags">
            {event.metadata.mentionedPeople.slice(0, 6).map((person) => (
              <span key={person.name} className="graf-details-tag">
                {person.name}
              </span>
            ))}
            {event.metadata.mentionedPeople.length > 6 && (
              <span className="graf-details-tag-more">
                +{event.metadata.mentionedPeople.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Mentioned Countries */}
      {event.metadata?.mentionedCountries && event.metadata.mentionedCountries.length > 0 && (
        <div className="graf-details-section">
          <h4 className="graf-details-section-title">Wspomniane kraje</h4>
          <div className="graf-details-tags">
            {event.metadata.mentionedCountries.slice(0, 6).map((country) => (
              <span key={country} className="graf-details-tag">
                {country}
              </span>
            ))}
            {event.metadata.mentionedCountries.length > 6 && (
              <span className="graf-details-tag-more">
                +{event.metadata.mentionedCountries.length - 6}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="graf-details-stats">
        <div className="graf-details-stat">
          <span className="graf-details-stat-value">
            {Math.round(event.trendingScore || 0)}
          </span>
          <span className="graf-details-stat-label">Trending</span>
        </div>
        <div className="graf-details-stat">
          <span className="graf-details-stat-value">{event.articleCount || 0}</span>
          <span className="graf-details-stat-label">Artykuły</span>
        </div>
        <div className="graf-details-stat">
          <span className="graf-details-stat-value">{event.sourceCount || 0}</span>
          <span className="graf-details-stat-label">Źródła</span>
        </div>
      </div>

      {/* Actions */}
      <div className="graf-details-actions">
        <button onClick={onNavigate} className="graf-details-button-primary">
          Zobacz szczegóły
        </button>
      </div>
    </motion.div>
  );
}
