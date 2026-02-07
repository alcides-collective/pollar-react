import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useProceedings, useCurrentProceeding } from '../../hooks/useProceedings';
import { SejmApiError } from '../../components/sejm';
import { useLanguage } from '../../stores/languageStore';

export function ProceedingsPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguage();
  const { proceedings, loading, error } = useProceedings();
  const { proceeding: currentProceeding } = useCurrentProceeding();

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface animate-pulse rounded" />
        <div className="h-24 bg-surface animate-pulse rounded-lg" />
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const formatDates = (dates: string[]) => {
    if (!dates || dates.length === 0) return '';
    const locale = localeMap[language] || 'pl-PL';
    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const first = new Date(dates[0]);
    const last = new Date(dates[dates.length - 1]);
    return `${first.toLocaleDateString(locale, { day: 'numeric' })}-${last.toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  // Sort by number descending (most recent first)
  const sortedProceedings = [...proceedings].sort((a, b) => b.number - a.number);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('proceedingsPage.title')}</h1>

      {/* Current proceeding */}
      {currentProceeding && (
        <LocalizedLink
          to={`/sejm/posiedzenia/${currentProceeding.number}`}
          className="block rounded-lg border-2 border-green-500 dark:border-green-700 bg-green-50 dark:bg-green-950/30 p-4 hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded animate-pulse">
              {t('proceedingsPage.live')}
            </span>
            <span className="text-sm text-content">
              {t('proceedingsPage.proceeding', { number: currentProceeding.number })}
            </span>
          </div>
          <h3 className="font-medium text-content-heading">{currentProceeding.title}</h3>
          <p className="text-sm text-content-subtle mt-1">{formatDates(currentProceeding.dates)}</p>
        </LocalizedLink>
      )}

      {/* All proceedings */}
      <div className="space-y-3">
        {sortedProceedings.map((proceeding) => (
          <LocalizedLink
            key={proceeding.number}
            to={`/sejm/posiedzenia/${proceeding.number}`}
            className="block rounded-lg border border-divider hover:border-divider hover:shadow-sm transition-all p-4"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-content-heading">
                    {t('proceedingsPage.proceeding', { number: proceeding.number })}
                  </span>
                  {proceeding.current && (
                    <span className="bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 text-[10px] px-1.5 py-0.5 rounded">
                      {t('proceedingsPage.current')}
                    </span>
                  )}
                </div>
                <h3 className="text-content">{proceeding.title}</h3>
              </div>
              <span className="text-sm text-content-faint shrink-0">
                {formatDates(proceeding.dates)}
              </span>
            </div>
          </LocalizedLink>
        ))}
      </div>
    </div>
  );
}
