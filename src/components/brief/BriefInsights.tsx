import { useTranslation } from 'react-i18next';
import type { BriefInsights as BriefInsightsType } from '../../types/brief';
import { sanitizeAndProcessInlineHtml } from '../../utils/text';

interface BriefInsightsProps {
  insights: BriefInsightsType;
}

export function BriefInsights({ insights }: BriefInsightsProps) {
  const { t } = useTranslation('brief');
  const hasInsights =
    insights.trends.length > 0 ||
    insights.correlations.length > 0 ||
    insights.anomalies.length > 0 ||
    insights.implications.length > 0 ||
    insights.metaCommentary;

  if (!hasInsights) return null;

  return (
    <section className="mb-12">
      <h2 className="text-sm text-content-subtle mb-3 pb-2 border-b border-divider font-medium">
        {t('insights.title')}
      </h2>

      {/* Grid 2x2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.trends.length > 0 && (
          <InsightCard
            label={t('insights.trends')}
            items={insights.trends}
            colorClass="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/30"
          />
        )}
        {insights.correlations.length > 0 && (
          <InsightCard
            label={t('insights.correlations')}
            items={insights.correlations}
            colorClass="border-purple-200 dark:border-purple-800 bg-purple-50/50 dark:bg-purple-950/30"
          />
        )}
        {insights.anomalies.length > 0 && (
          <InsightCard
            label={t('insights.anomalies')}
            items={insights.anomalies}
            colorClass="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/30"
          />
        )}
        {insights.implications.length > 0 && (
          <InsightCard
            label={t('insights.implications')}
            items={insights.implications}
            colorClass="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/30"
          />
        )}
      </div>

      {/* Meta Commentary */}
      {insights.metaCommentary && (
        <div className="mt-4 p-4 rounded-lg border border-divider bg-surface/50">
          <p className="text-xs uppercase tracking-wider text-content-subtle mb-2 font-semibold">
            {t('insights.metaCommentary')}
          </p>
          <p
            className="text-sm text-content"
            dangerouslySetInnerHTML={{ __html: sanitizeAndProcessInlineHtml(insights.metaCommentary) }}
          />
        </div>
      )}
    </section>
  );
}

interface InsightCardProps {
  label: string;
  items: string[];
  colorClass: string;
}

function InsightCard({ label, items, colorClass }: InsightCardProps) {
  return (
    <article className={`p-4 rounded-lg border ${colorClass}`}>
      <p className="text-xs uppercase tracking-wider text-content font-semibold mb-3">
        {label}
      </p>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <li
            key={i}
            className="text-sm text-content p-2 rounded border border-divider/50 bg-background/50"
            dangerouslySetInnerHTML={{ __html: sanitizeAndProcessInlineHtml(item) }}
          />
        ))}
      </ul>
    </article>
  );
}
