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
        <div className="h-8 w-48 bg-zinc-100 animate-pulse rounded" />
        <div className="grid gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-lg" />
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
      <h1 className="text-xl font-semibold text-zinc-900">{t('committeesPage.title')}</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((option) => (
          <button
            key={option.value}
            onClick={() => setFilter(option.value as FilterOption)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              filter === option.value
                ? 'bg-zinc-900 text-white'
                : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
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
            className="block rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all p-4"
          >
            <div className="flex items-start gap-3">
              <span className="shrink-0 bg-zinc-100 text-zinc-600 text-xs font-mono px-2 py-0.5 rounded">
                {committee.code}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-zinc-900">{committee.name}</h3>
                {committee.scope && (
                  <p className="text-sm text-zinc-500 mt-1 line-clamp-2">{committee.scope}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-zinc-400">
                  <span className={`px-1.5 py-0.5 rounded ${
                    committee.type === 'standing' ? 'bg-blue-100 text-blue-700' :
                    committee.type === 'extraordinary' ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
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
