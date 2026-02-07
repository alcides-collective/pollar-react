import { useState, useMemo } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useProcesses } from '../../hooks/useProcesses';
import { SejmApiError } from '../../components/sejm';
import { useLanguageStore } from '../../stores/languageStore';

type FilterOption = 'all' | 'passed' | 'pending';

export function ProcessesPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { processes, loading, error } = useProcesses({ limit: 100 });
  const [filter, setFilter] = useState<FilterOption>('all');

  const filteredProcesses = useMemo(() => {
    if (filter === 'all') return processes;
    if (filter === 'passed') return processes.filter(p => p.passed);
    return processes.filter(p => !p.passed);
  }, [processes, filter]);

  const counts = useMemo(() => ({
    all: processes.length,
    passed: processes.filter(p => p.passed).length,
    pending: processes.filter(p => !p.passed).length,
  }), [processes]);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface animate-pulse rounded" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('processesPage.title')}</h1>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: t('processesPage.all') },
          { value: 'passed', label: t('processesPage.passed') },
          { value: 'pending', label: t('processesPage.pending') },
        ].map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as FilterOption)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === option.value
                ? 'bg-primary text-primary-foreground'
                : 'bg-surface text-content hover:bg-surface'
            }`}
          >
            {option.label}
            <span className="ml-1 text-xs opacity-70">
              ({counts[option.value as FilterOption]})
            </span>
          </button>
        ))}
      </div>

      {/* Processes list */}
      <div className="space-y-3">
        {filteredProcesses.map((process) => (
          <div
            key={process.number}
            className="block rounded-lg border border-divider p-4"
          >
            <div className="flex items-start gap-3 mb-2">
              <span className={`shrink-0 w-1 h-full rounded-full ${
                process.passed ? 'bg-green-500' : 'bg-amber-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {process.documentType && (
                    <span className="text-xs text-content-subtle uppercase tracking-wide">
                      {process.documentType}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    process.passed
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                  }`}>
                    {process.passed ? t('processesPage.passedLabel') : t('processesPage.pendingLabel')}
                  </span>
                </div>
                <h3 className="font-medium text-content-heading line-clamp-2">{process.title}</h3>
                {process.createdBy && (
                  <p className="text-sm text-content-subtle mt-1">
                    {t('processesPage.submitter')}: {process.createdBy}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-content-faint">
                  <span>{t('processesPage.started')}: {formatDate(process.processStartDate)}</span>
                  {process.printsNumbers && process.printsNumbers.length > 0 && (
                    <span className="flex items-center gap-1">
                      {t('processesPage.prints')}:
                      {process.printsNumbers.slice(0, 3).map((num) => (
                        <LocalizedLink
                          key={num}
                          to={`/sejm/druki/${num}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          {num}
                        </LocalizedLink>
                      ))}
                      {process.printsNumbers.length > 3 && (
                        <span>+{process.printsNumbers.length - 3}</span>
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProcesses.length === 0 && (
        <p className="text-center text-content-subtle py-8">
          {t('processesPage.noResults')}
        </p>
      )}
    </div>
  );
}
