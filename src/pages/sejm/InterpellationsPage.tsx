import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useInterpellations, fetchInterpellationBody } from '../../hooks/useInterpellations';
import { InterpellationCard, SejmApiError } from '../../components/sejm';
import type { SejmInterpellation } from '../../types/sejm';

type FilterOption = 'all' | 'answered' | 'pending';

export function InterpellationsPage() {
  const { t } = useTranslation('sejm');
  const { interpellations, hasMore, loading, loadingMore, loadMore, error } = useInterpellations();
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
        <div className="h-8 w-48 bg-zinc-100 animate-pulse rounded" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-zinc-100 animate-pulse rounded-lg" />
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
      <h1 className="text-xl font-semibold text-zinc-900">{t('interpellationsPage.title')}</h1>

      {/* Filters */}
      <div className="flex gap-2">
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

      {/* Grid */}
      <div className="grid gap-3 md:grid-cols-2">
        {filteredInterpellations.map((interpellation) => (
          <InterpellationCard
            key={interpellation.num}
            interpellation={interpellation}
            onClick={() => handleOpenInterpellation(interpellation)}
          />
        ))}
      </div>

      {filteredInterpellations.length === 0 && (
        <p className="text-center text-zinc-500 py-8">
          {t('interpellationsPage.noResults')}
        </p>
      )}

      {hasMore && filter === 'all' && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loadingMore ? t('interpellationsPage.loading') : t('interpellationsPage.loadMore')}
          </button>
        </div>
      )}

      {/* Modal */}
      {selectedInterpellation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={closeModal}>
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 border-b border-zinc-200 flex items-start justify-between">
              <div>
                <span className="text-xs text-zinc-500">{t('interpellationsPage.interpellationNumber', { num: selectedInterpellation.num })}</span>
                <h2 className="font-medium text-zinc-900 mt-1">{selectedInterpellation.title}</h2>
              </div>
              <button
                onClick={closeModal}
                className="text-zinc-400 hover:text-zinc-600"
              >
                <i className="ri-close-line text-2xl" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              {loadingBody ? (
                <div className="space-y-2">
                  <div className="h-4 bg-zinc-100 animate-pulse rounded" />
                  <div className="h-4 bg-zinc-100 animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-zinc-100 animate-pulse rounded w-1/2" />
                </div>
              ) : (
                <div
                  className="prose prose-sm max-w-none text-zinc-700"
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
