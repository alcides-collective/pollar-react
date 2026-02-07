import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterpellations, fetchInterpellationBody } from '../../hooks/useInterpellations';
import { useMPsMap } from '../../hooks/useMPs';
import { InterpellationCard, SejmApiError } from '../../components/sejm';
import { LocalizedLink } from '../../components/LocalizedLink';
import type { SejmInterpellation } from '../../types/sejm';

type FilterOption = 'all' | 'answered' | 'pending';

export function InterpellationsPage() {
  const { t } = useTranslation('sejm');
  const { interpellations, hasMore, loading, loadingMore, loadMore, error } = useInterpellations();
  const { mpsMap } = useMPsMap();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [selectedInterpellation, setSelectedInterpellation] = useState<SejmInterpellation | null>(null);
  const [bodyContent, setBodyContent] = useState<string | null>(null);
  const [loadingBody, setLoadingBody] = useState(false);

  const filteredInterpellations = useMemo(() => {
    if (filter === 'all') return interpellations;
    if (filter === 'answered') return interpellations.filter(i => i.replies && i.replies.length > 0);
    return interpellations.filter(i => !i.replies || i.replies.length === 0);
  }, [interpellations, filter]);

  const counts = useMemo(() => ({
    all: interpellations.length,
    answered: interpellations.filter(i => i.replies && i.replies.length > 0).length,
    pending: interpellations.filter(i => !i.replies || i.replies.length === 0).length,
  }), [interpellations]);

  const handleOpenInterpellation = async (interpellation: SejmInterpellation) => {
    setSelectedInterpellation(interpellation);
    setBodyContent(null);
    setLoadingBody(true);
    try {
      const body = await fetchInterpellationBody(interpellation.term, interpellation.num);
      setBodyContent(body);
    } catch (err) {
      setBodyContent(t('interpellationsPage.fetchError'));
    } finally {
      setLoadingBody(false);
    }
  };

  const closeModal = () => {
    setSelectedInterpellation(null);
    setBodyContent(null);
  };

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-surface animate-pulse rounded" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const filterOptions = [
    { value: 'all', label: t('interpellationsPage.all') },
    { value: 'answered', label: t('interpellationsPage.answered') },
    { value: 'pending', label: t('interpellationsPage.pending') },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('interpellationsPage.title')}</h1>

      {/* Filters */}
      <div className="flex gap-2">
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

      {/* Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filteredInterpellations.map((interpellation) => (
          <InterpellationCard
            key={interpellation.num}
            interpellation={interpellation}
            mpsMap={mpsMap}
            onClick={() => handleOpenInterpellation(interpellation)}
          />
        ))}
      </div>

      {filteredInterpellations.length === 0 && (
        <p className="text-center text-content-subtle py-8">
          {t('interpellationsPage.noResults')}
        </p>
      )}

      {hasMore && filter === 'all' && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-surface text-content rounded-md hover:bg-surface transition-colors disabled:opacity-50"
          >
            {loadingMore ? t('interpellationsPage.loading') : t('interpellationsPage.loadMore')}
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedInterpellation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div
            className="bg-background rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-4 border-b border-divider flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs bg-surface text-content font-mono px-2 py-0.5 rounded">
                    #{selectedInterpellation.num}
                  </span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded ${
                    selectedInterpellation.replies && selectedInterpellation.replies.length > 0
                      ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
                      : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
                  }`}>
                    {selectedInterpellation.replies && selectedInterpellation.replies.length > 0 ? 'Odpowiedziano' : 'Oczekuje'}
                  </span>
                </div>
                <h2 className="font-medium text-content-heading">{selectedInterpellation.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="shrink-0 text-content-faint hover:text-content"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>

            {/* Authors */}
            <div className="px-4 py-3 border-b border-divider-subtle bg-surface">
              <div className="text-xs text-content-subtle mb-2">{t('interpellationsPage.authors')}</div>
              <div className="flex flex-wrap gap-2">
                {selectedInterpellation.from.map((idStr) => {
                  const id = parseInt(idStr, 10);
                  const mp = mpsMap && !isNaN(id) ? mpsMap.get(id) : null;
                  if (!mp) return null;
                  return (
                    <LocalizedLink
                      key={id}
                      to={`/sejm/poslowie/${id}`}
                      className="flex items-center gap-2 bg-background rounded-full pr-3 pl-1 py-1 border border-divider hover:border-divider hover:shadow-sm transition-all"
                      onClick={closeModal}
                    >
                      <img
                        src={mp.photoMiniUrl || mp.photoUrl}
                        alt={mp.firstLastName}
                        className="w-6 h-6 rounded-full object-cover bg-surface"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://api.sejm.gov.pl/sejm/term10/MP/${id}/photo-mini`;
                        }}
                      />
                      <span className="text-sm text-content">{mp.firstLastName}</span>
                      <span className="text-[10px] text-content-faint">{mp.club}</span>
                    </LocalizedLink>
                  );
                })}
              </div>
              <div className="text-xs text-content-subtle mt-3 mb-1">{t('interpellationsPage.recipients')}</div>
              <div className="text-sm text-content">
                {selectedInterpellation.to.join(', ')}
              </div>
            </div>

            {/* Body */}
            <div className="p-4 overflow-y-auto flex-1">
              {loadingBody ? (
                <div className="space-y-2">
                  <div className="h-4 bg-surface animate-pulse rounded" />
                  <div className="h-4 bg-surface animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-surface animate-pulse rounded w-1/2" />
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-content"
                  dangerouslySetInnerHTML={{ __html: bodyContent || '' }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
