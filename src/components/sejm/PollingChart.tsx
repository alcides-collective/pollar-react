import { useState } from 'react';
import { usePolling } from '../../hooks/usePolling';
import { getPartyColor, getPartyShort } from '../../types/sejm';
import type { PollResult } from '../../utils/polling-scraper';

// Map Wikipedia party names to our internal names
const PARTY_MAP: Record<string, string> = {
  'PiS': 'PiS',
  'KO': 'KO',
  'Polska2050': 'Polska2050',
  'PSL': 'PSL-TD',
  'Lewica': 'Lewica',
  'Razem': 'Razem',
  'Konfederacja': 'Konfederacja',
  'KKP': 'Konfederacja_KP',
};

// Order for display
const PARTY_ORDER = ['KO', 'PiS', 'Konfederacja', 'Lewica', 'Polska2050', 'PSL', 'Razem', 'KKP'] as const;

export function PollingChart() {
  const { data, average, uncertainty, trend, meta, loading, error } = usePolling();
  const [expanded, setExpanded] = useState(false);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-zinc-900" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 py-4">
        Błąd pobierania sondaży: {error.message}
      </div>
    );
  }

  if (!average) {
    return (
      <p className="text-sm text-zinc-500 py-4">
        Brak danych sondażowych
      </p>
    );
  }

  // Build average data array
  const averageData = PARTY_ORDER
    .map(key => ({
      party: key,
      internalName: PARTY_MAP[key] || key,
      value: average[key as keyof typeof average] || 0,
      uncertainty: uncertainty?.[key as keyof typeof uncertainty] || 0,
      trend: trend?.[key as keyof typeof trend] || 0,
    }))
    .filter(d => d.value && d.value > 0)
    .sort((a, b) => (b.value || 0) - (a.value || 0));

  const latestPolls = data?.polls.slice(0, 5) || [];
  const maxValue = Math.max(...averageData.map(d => d.value || 0), 1);

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const date = new Date(dateStr);
      return date.toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
    }
    return dateStr;
  };

  const getPollValue = (poll: PollResult, party: string): number | null => {
    return poll.results[party as keyof typeof poll.results] ?? null;
  };

  return (
    <div className="w-full min-w-0">
      {/* Average bars */}
      <div className="mb-6">
        <h4 className="text-xs text-zinc-500 uppercase tracking-wide mb-3">
          Średnia ważona
          {meta && (
            <span className="text-[9px] normal-case opacity-60 ml-1">
              · {meta.pollsUsed} sondaży · t½={meta.halfLife}d
            </span>
          )}
        </h4>
        <div className="space-y-2">
          {averageData.map(({ party, internalName, value, trend: t }) => {
            const trendColor = t > 0 ? '#22c55e' : t < 0 ? '#ef4444' : '#9ca3af';
            return (
              <div key={party} className="flex items-center gap-2">
                <div className="text-xs text-zinc-700 w-16 truncate font-medium">
                  {getPartyShort(internalName)}
                </div>
                <div className="flex-1 h-5 bg-zinc-100 rounded-r overflow-hidden">
                  <div
                    className="h-full rounded-r transition-all duration-500"
                    style={{
                      width: `${((value || 0) / maxValue) * 100}%`,
                      background: trendColor,
                    }}
                  />
                </div>
                <div className="text-xs text-zinc-900 flex items-center gap-1 shrink-0 font-mono">
                  <span className="w-12 text-right">{value?.toFixed(1)}%</span>
                  <span
                    className={`text-[10px] px-1 rounded-sm ${
                      t > 0
                        ? 'text-green-600 bg-green-500/10'
                        : t < 0
                        ? 'text-red-600 bg-red-500/10'
                        : 'text-zinc-400 bg-zinc-100'
                    }`}
                  >
                    {t > 0 ? '↑' : t < 0 ? '↓' : '•'}
                    {Math.abs(t).toFixed(1)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent polls table */}
      {latestPolls.length > 0 && (
        <div>
          {/* Toggle button */}
          <button
            className="w-full py-1.5 flex items-center justify-center gap-1.5 text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors uppercase tracking-wide"
            onClick={() => setExpanded(!expanded)}
            aria-expanded={expanded}
          >
            <span>{expanded ? 'Zwiń sondaże' : 'Pokaż ostatnie sondaże'}</span>
            <i className={`ri-arrow-down-s-line transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`} />
          </button>

          {expanded && (
            <div className="mt-3 overflow-x-auto">
              <table className="text-xs w-max">
                <thead>
                  <tr className="text-[10px] text-zinc-400 uppercase tracking-wide">
                    <th className="pb-2 text-left pr-3 whitespace-nowrap">Sondaż</th>
                    <th className="pb-2 text-left pr-3 whitespace-nowrap">Data</th>
                    {averageData.map(({ party, internalName }) => (
                      <th key={party} className="pb-2 text-right px-1.5 whitespace-nowrap">
                        <span
                          className="inline-block w-2 h-2 rounded-sm mr-0.5"
                          style={{ background: getPartyColor(internalName).bg }}
                        />
                        {getPartyShort(internalName)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {latestPolls.map((poll, idx) => (
                    <tr key={idx} className="border-t border-zinc-100">
                      <td className="py-2 pr-3 text-zinc-700 whitespace-nowrap text-[11px]">
                        {poll.pollster}
                      </td>
                      <td className="py-2 pr-3 text-zinc-500 whitespace-nowrap">
                        {formatDate(poll.date)}
                      </td>
                      {averageData.map(({ party }) => {
                        const val = getPollValue(poll, party);
                        return (
                          <td key={party} className="py-2 px-1.5 text-right whitespace-nowrap font-mono">
                            {val ? (
                              <span className="text-zinc-800">{val.toFixed(1)}</span>
                            ) : (
                              <span className="text-zinc-300">—</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Source */}
      <div className="mt-4 pt-3 border-t border-zinc-100">
        <a
          href={data?.source}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] text-zinc-400 hover:text-zinc-600"
        >
          Źródło: Wikipedia · Aktualizacja: {new Date(data?.lastUpdate || '').toLocaleDateString('pl-PL')}
        </a>
      </div>
    </div>
  );
}
