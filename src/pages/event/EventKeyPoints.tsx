import { useTranslation } from 'react-i18next';
import type { KeyPoint } from '../../types/events';
import { sanitizeAndProcessInlineHtml } from '../../utils/text';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';

interface EventKeyPointsProps {
  keyPoints: KeyPoint[];
}

const priorityStyles: Record<KeyPoint['priority'], string> = {
  high: 'bg-red-50 dark:bg-red-950/30 text-red-900 dark:text-red-300 ring-1 ring-red-200 dark:ring-red-800/50',
  medium: 'bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 ring-1 ring-amber-200 dark:ring-amber-800/50',
  low: 'bg-surface text-content ring-1 ring-border dark:ring-divider',
};

export function EventKeyPoints({ keyPoints }: EventKeyPointsProps) {
  const { t } = useTranslation('event');
  const lang = useRouteLanguage();
  if (!keyPoints || keyPoints.length === 0) return null;

  return (
    <section className="key-points px-6 py-6 border-t border-divider">
      <h2 className="text-xs font-medium uppercase tracking-wider text-content-subtle mb-4">
        {t('keyPoints')}
      </h2>
      <ul className="space-y-4">
        {keyPoints.map((point, index) => (
          <li key={index} className="flex gap-3">
            <span className={`shrink-0 w-6 h-6 rounded-full text-xs font-medium flex items-center justify-center ${priorityStyles[point.priority] || priorityStyles.low}`}>
              {index + 1}
            </span>
            <div className="key-point-content">
              <h3 className="key-point-title text-content-heading mb-1">
                {point.title}
              </h3>
              <p
                className="text-sm text-content leading-relaxed"
                dangerouslySetInnerHTML={{ __html: sanitizeAndProcessInlineHtml(point.description, lang) }}
              />
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
