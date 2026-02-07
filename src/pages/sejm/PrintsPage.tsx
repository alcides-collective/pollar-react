import { useTranslation } from 'react-i18next';
import { usePrints } from '../../hooks/usePrints';
import { PrintCard, SejmApiError } from '../../components/sejm';

export function PrintsPage() {
  const { t } = useTranslation('sejm');
  const { prints, hasMore, loading, loadingMore, loadMore, error } = usePrints();

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-content-heading">{t('printsPage.title')}</h1>

      <div className="grid gap-3 md:grid-cols-2">
        {prints.map((print) => (
          <PrintCard key={print.number} print={print} />
        ))}
      </div>

      {prints.length === 0 && (
        <p className="text-center text-content-subtle py-8">
          {t('printsPage.noResults')}
        </p>
      )}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-surface text-content rounded-md hover:bg-surface transition-colors disabled:opacity-50"
          >
            {loadingMore ? t('printsPage.loading') : t('printsPage.loadMore')}
          </button>
        </div>
      )}
    </div>
  );
}
