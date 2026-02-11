import { useTranslation } from 'react-i18next';
import { sanitizeAndProcessHtml } from '../../utils/text';
import { useRouteLanguage } from '../../hooks/useRouteLanguage';

interface BriefExecutiveSummaryProps {
  summary: string;
}

export function BriefExecutiveSummary({ summary }: BriefExecutiveSummaryProps) {
  const { t } = useTranslation('brief');
  const lang = useRouteLanguage();
  return (
    <div className="mb-10">
      <h2 className="text-sm text-content-subtle mb-3 pb-2 border-b border-divider font-medium">
        {t('summary')}
      </h2>
      <div
        className="prose prose-zinc max-w-none text-content leading-relaxed"
        dangerouslySetInnerHTML={{ __html: sanitizeAndProcessHtml(summary, lang) }}
      />
    </div>
  );
}
