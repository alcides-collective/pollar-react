import { useState, useMemo } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useCommittees } from '../../hooks/useCommittees';
import { SejmApiError } from '../../components/sejm';

type FilterOption = 'all' | 'standing' | 'extraordinary' | 'investigative';

export function CommitteesPage() {
  const { t } = useTranslation('sejm');
  const { committees, loading, error } = useCommittees();
  const [filter, setFilter] = useState<FilterOption>('all');

  const filteredCommittees = useMemo(() => {
    if (filter === 'all') return committees;
    return committees.filter(c => c.type === filter);
  }, [committees, filter]);

  const counts = useMemo(() => ({
    all: committees.length,
    standing: committees.filter(c => c.type === 'standing').length,
    extraordinary: committees.filter(c => c.type === 'extraordinary').length,
    investigative: committees.filter(c => c.type === 'investigative').length,
  }), [committees]);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface animate-pulse rounded" />
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    standing: t('committeesPage.typeStanding'),
    extraordinary: t('committeesPage.typeExtraordinary'),
    investigative: t('committeesPage.typeInvestigative'),
  };

  const filterOptions = [
    { value: 'all', label: t('committeesPage.all') },
    { value: 'standing', label: t('committeesPage.standing') },
    { value: 'extraordinary', label: t('committeesPage.extraordinary') },
    { value: 'investigative', label: t('committeesPage.investigative') },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('committeesPage.title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
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

      {/* Committees list */}
      <div className="grid gap-3">
        {filteredCommittees.map((committee) => (
          <LocalizedLink
            key={committee.code}
            to={`/sejm/komisje/${committee.code}`}
            className="block rounded-lg border border-divider hover:border-divider hover:shadow-sm transition-all p-4"
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 bg-surface text-content text-xs font-mono px-2 py-0.5 rounded">
                {committee.code}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-content-heading">{committee.name}</h3>
                {committee.scope && (
                  <p className="text-sm text-content-subtle mt-1 line-clamp-2">{committee.scope}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-content-faint">
                  <span className={`px-1.5 py-0.5 rounded ${
                    committee.type === 'standing' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' :
                    committee.type === 'extraordinary' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
                    'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
                  }`}>
                    {typeLabels[committee.type]}
                  </span>
                </div>
              </div>
            </div>
          </LocalizedLink>
        ))}
      </div>
    </div>
  );
}
