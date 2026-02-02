import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useProcesses } from '../../hooks/useProcesses';
import { SejmApiError } from '../../components/sejm';

type FilterOption = 'all' | 'passed' | 'pending';

export function ProcessesPage() {
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
        <div className="h-8 w-48 bg-zinc-100 animate-pulse rounded" />
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900">Procesy legislacyjne</h1>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: 'all', label: 'Wszystkie' },
          { value: 'passed', label: 'Uchwalone' },
          { value: 'pending', label: 'W trakcie' },
        ].map((option) => (
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

      {/* Processes list */}
      <div className="space-y-3">
        {filteredProcesses.map((process) => (
          <div
            key={process.number}
            className="block rounded-lg border border-zinc-200 p-4"
          >
            <div className="flex items-start gap-3 mb-2">
              <span className={`shrink-0 w-1 h-full rounded-full ${
                process.passed ? 'bg-green-500' : 'bg-amber-500'
              }`} />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {process.documentType && (
                    <span className="text-xs text-zinc-500 uppercase tracking-wide">
                      {process.documentType}
                    </span>
                  )}
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                    process.passed
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}>
                    {process.passed ? 'Uchwalono' : 'W trakcie'}
                  </span>
                </div>
                <h3 className="font-medium text-zinc-900 line-clamp-2">{process.title}</h3>
                {process.createdBy && (
                  <p className="text-sm text-zinc-500 mt-1">
                    Wnioskodawca: {process.createdBy}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                  <span>Rozpoczęto: {formatDate(process.processStartDate)}</span>
                  {process.printsNumbers && process.printsNumbers.length > 0 && (
                    <span className="flex items-center gap-1">
                      Druki:
                      {process.printsNumbers.slice(0, 3).map((num) => (
                        <Link
                          key={num}
                          to={`/sejm/druki/${num}`}
                          className="text-blue-600 hover:underline"
                        >
                          {num}
                        </Link>
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
        <p className="text-center text-zinc-500 py-8">
          Brak procesów do wyświetlenia
        </p>
      )}
    </div>
  );
}
