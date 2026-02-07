import { getPartyColor, getPartyShort } from '../../types/sejm';
import type { SejmStats as SejmStatsType } from '../../types/sejm';

interface SejmStatsProps {
  stats: SejmStatsType;
}

export function SejmStats({ stats }: SejmStatsProps) {
  const { mps } = stats;
  const total = 460; // Total seats in Sejm

  // Sort clubs by count descending
  const sortedClubs = Object.entries(mps.byClub)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="rounded-lg border border-divider p-4">
      <h3 className="text-sm font-medium text-content-heading mb-3">Rozkład mandatów</h3>

      {/* Stacked bar */}
      <div className="h-6 flex rounded overflow-hidden mb-3">
        {sortedClubs.map(([club, count]) => {
          const color = getPartyColor(club);
          const width = (count / total) * 100;
          return (
            <div
              key={club}
              className="relative group"
              style={{
                width: `${width}%`,
                backgroundColor: color.bg,
              }}
              title={`${getPartyShort(club)}: ${count}`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {sortedClubs.map(([club, count]) => {
          const color = getPartyColor(club);
          return (
            <div key={club} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-sm"
                style={{ backgroundColor: color.bg }}
              />
              <span className="text-content">
                {getPartyShort(club)}: {count}
              </span>
            </div>
          );
        })}
      </div>

      {/* Summary stats */}
      <div className="mt-4 pt-3 border-t border-divider-subtle grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-lg font-semibold text-content-heading">{mps.active}</div>
          <div className="text-[10px] text-content-subtle uppercase tracking-wide">Aktywnych</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-content-heading">{stats.votings.recent}</div>
          <div className="text-[10px] text-content-subtle uppercase tracking-wide">Głosowań</div>
        </div>
        <div>
          <div className="text-lg font-semibold text-content-heading">{stats.prints.recent}</div>
          <div className="text-[10px] text-content-subtle uppercase tracking-wide">Druków</div>
        </div>
      </div>
    </div>
  );
}
