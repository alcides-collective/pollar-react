import { useParams, Link } from 'react-router-dom';
import { useProceeding } from '../../hooks/useProceedings';
import { SejmApiError } from '../../components/sejm';

export function ProceedingDetailPage() {
  const { number } = useParams<{ number: string }>();
  const { proceeding, loading, error } = useProceeding(number ? parseInt(number) : null);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-zinc-100 animate-pulse rounded" />
        <div className="h-32 bg-zinc-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!proceeding) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">Nie znaleziono posiedzenia</p>
        <Link to="/sejm/posiedzenia" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          ← Wróć do listy
        </Link>
      </div>
    );
  }

  const formatDates = (dates: string[]) => {
    if (!dates || dates.length === 0) return '';
    if (dates.length === 1) {
      return new Date(dates[0]).toLocaleDateString('pl-PL', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
    }
    const first = new Date(dates[0]);
    const last = new Date(dates[dates.length - 1]);
    return `${first.toLocaleDateString('pl-PL', { day: 'numeric' })}-${last.toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Link to="/sejm/posiedzenia" className="text-sm text-zinc-500 hover:text-zinc-700">
        ← Wszystkie posiedzenia
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-lg font-semibold text-zinc-900">
            {proceeding.number}. posiedzenie Sejmu
          </span>
          {proceeding.current && (
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded animate-pulse">
              Na żywo
            </span>
          )}
        </div>
        <h1 className="text-xl text-zinc-700">{proceeding.title}</h1>
        <p className="text-zinc-500 mt-2">{formatDates(proceeding.dates)}</p>
      </div>

      {/* Agenda */}
      {proceeding.agenda && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-3">Porządek obrad</h2>
          <div
            className="prose prose-sm max-w-none text-zinc-700"
            dangerouslySetInnerHTML={{ __html: proceeding.agenda }}
          />
        </div>
      )}
    </div>
  );
}
