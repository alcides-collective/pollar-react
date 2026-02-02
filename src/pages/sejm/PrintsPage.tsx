import { usePrints } from '../../hooks/usePrints';
import { PrintCard, SejmApiError } from '../../components/sejm';

export function PrintsPage() {
  const { prints, hasMore, loading, loadingMore, loadMore, error } = usePrints();

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

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900">Druki sejmowe</h1>

      <div className="grid gap-3 md:grid-cols-2">
        {prints.map((print) => (
          <PrintCard key={print.number} print={print} />
        ))}
      </div>

      {prints.length === 0 && (
        <p className="text-center text-zinc-500 py-8">
          Brak druków do wyświetlenia
        </p>
      )}

      {hasMore && (
        <div className="text-center pt-4">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 bg-zinc-100 text-zinc-700 rounded-md hover:bg-zinc-200 transition-colors disabled:opacity-50"
          >
            {loadingMore ? 'Ładowanie...' : 'Załaduj więcej'}
          </button>
        </div>
      )}
    </div>
  );
}
