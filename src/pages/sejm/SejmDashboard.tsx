import { useState, useMemo } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useSejmStats } from '../../hooks/useSejmStats';
import { useMPs } from '../../hooks/useMPs';
import { useVotings } from '../../hooks/useVotings';
import { useCurrentProceeding } from '../../hooks/useProceedings';
import { SejmStats, VotingCard, SejmApiError, PollingChart } from '../../components/sejm';
import { getPartyColor } from '../../types/sejm';
import { useIsAuthenticated } from '../../stores/authStore';
import { useFollowedMPIds } from '../../stores/userStore';
import type { SejmMP } from '../../types/sejm';

type SortOption = 'votes' | 'attendance_high' | 'attendance_low' | 'youngest' | 'oldest';

const sortOptionKeys: SortOption[] = ['votes', 'attendance_high', 'attendance_low', 'youngest', 'oldest'];

function getMpDisplayValue(mp: SejmMP, sortBy: SortOption, t: (key: string, options?: Record<string, unknown>) => string): string {
  switch (sortBy) {
    case 'votes':
      return (mp.numberOfVotes || 0).toLocaleString('pl-PL');
    case 'attendance_high':
    case 'attendance_low':
      return `${mp.attendance || 0}%`;
    case 'youngest':
    case 'oldest':
      if (!mp.birthDate) return '';
      const age = Math.floor((Date.now() - new Date(mp.birthDate).getTime()) / (365.25 * 24 * 60 * 60 * 1000));
      return t('age.years', { count: age });
    default:
      return '';
  }
}

export function SejmDashboard() {
  const { t } = useTranslation('sejm');
  const { stats, loading: statsLoading, error: statsError } = useSejmStats();
  const { mps, loading: mpsLoading } = useMPs();
  const { votings, loading: votingsLoading } = useVotings();
  const { proceeding: currentProceeding } = useCurrentProceeding();
  const [selectedSort, setSelectedSort] = useState<SortOption>('votes');
  const isAuthenticated = useIsAuthenticated();
  const followedMPIds = useFollowedMPIds();

  const sortOptions = sortOptionKeys.map(key => ({
    value: key,
    label: t(`sort.${key === 'votes' ? 'mostVotes' : key === 'attendance_high' ? 'highestAttendance' : key === 'attendance_low' ? 'lowestAttendance' : key}`),
  }));

  // Get followed MPs data
  const followedMPs = useMemo(() => {
    if (!isAuthenticated || followedMPIds.length === 0) return [];
    return mps.filter((mp) => followedMPIds.includes(mp.id));
  }, [mps, followedMPIds, isAuthenticated]);

  const topMPs = useMemo(() => {
    const activeMps = mps.filter(mp => mp.active);

    switch (selectedSort) {
      case 'votes':
        return activeMps
          .filter(mp => mp.numberOfVotes && mp.numberOfVotes > 0)
          .sort((a, b) => (b.numberOfVotes || 0) - (a.numberOfVotes || 0))
          .slice(0, 12);
      case 'attendance_high':
        return activeMps
          .filter(mp => mp.attendance !== undefined)
          .sort((a, b) => (b.attendance || 0) - (a.attendance || 0))
          .slice(0, 12);
      case 'attendance_low':
        return activeMps
          .filter(mp => mp.attendance !== undefined)
          .sort((a, b) => (a.attendance || 0) - (b.attendance || 0))
          .slice(0, 12);
      case 'youngest':
        return activeMps
          .filter(mp => mp.birthDate)
          .sort((a, b) => new Date(b.birthDate || '').getTime() - new Date(a.birthDate || '').getTime())
          .slice(0, 12);
      case 'oldest':
        return activeMps
          .filter(mp => mp.birthDate)
          .sort((a, b) => new Date(a.birthDate || '').getTime() - new Date(b.birthDate || '').getTime())
          .slice(0, 12);
      default:
        return activeMps.slice(0, 12);
    }
  }, [mps, selectedSort]);

  if (statsError) {
    return <SejmApiError message={statsError.message} />;
  }

  if (statsLoading || mpsLoading || votingsLoading) {
    return (
      <div className="space-y-6">
        <div className="h-40 bg-zinc-100 animate-pulse rounded-lg" />
        <div className="h-60 bg-zinc-100 animate-pulse rounded-lg" />
        <div className="h-40 bg-zinc-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  // Get recent votings
  const recentVotings = votings.slice(0, 4);

  return (
    <div className="space-y-6">
      {/* Followed MPs Section - only for authenticated users */}
      {isAuthenticated && followedMPs.length > 0 && (
        <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-zinc-900">
              {t('dashboard.followedMPs', { count: followedMPs.length })}
            </h3>
            <LocalizedLink
              to="/sejm/poslowie"
              className="text-xs text-zinc-500 hover:text-zinc-700"
            >
              {t('dashboard.addMore')} <i className="ri-arrow-right-s-line" />
            </LocalizedLink>
          </div>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {followedMPs.slice(0, 10).map((mp) => {
              const color = getPartyColor(mp.club);
              return (
                <LocalizedLink
                  key={mp.id}
                  to={`/sejm/poslowie/${mp.id}`}
                  className="group flex flex-col items-center text-center"
                >
                  <div className="relative">
                    <img
                      src={mp.photoUrl}
                      alt={mp.firstLastName}
                      className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm group-hover:border-blue-300 transition-colors"
                    />
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white"
                      style={{ backgroundColor: color.bg }}
                    />
                  </div>
                  <p className="text-[10px] text-zinc-600 mt-1 line-clamp-1 max-w-full">
                    {mp.lastName}
                  </p>
                </LocalizedLink>
              );
            })}
          </div>
          {followedMPs.length > 10 && (
            <p className="text-xs text-zinc-500 mt-3 text-center">
              {t('dashboard.andMore', { count: followedMPs.length - 10 })}
            </p>
          )}
        </div>
      )}

      {/* Stats and Polling - side by side on larger screens */}
      <div className="grid gap-4 lg:grid-cols-2">
        {stats && <SejmStats stats={stats} />}

        {/* Polling */}
        <div className="rounded-lg border border-zinc-200 p-4 min-w-0 overflow-hidden">
          <h3 className="text-sm font-medium text-zinc-900 mb-4">{t('dashboard.polls')}</h3>
          <PollingChart />
        </div>
      </div>

      {/* Current Proceeding */}
      {currentProceeding && (
        <LocalizedLink
          to={`/sejm/posiedzenia/${currentProceeding.number}`}
          className="block rounded-lg border-2 border-green-500 bg-green-50 p-4 hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-green-500 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded animate-pulse">
              {t('dashboard.live')}
            </span>
            <span className="text-sm text-zinc-600">
              {t('dashboard.proceedingNumber', { number: currentProceeding.number })}
            </span>
          </div>
          <h3 className="font-medium text-zinc-900">{currentProceeding.title}</h3>
        </LocalizedLink>
      )}

      {/* Top MPs */}
      <div className="rounded-lg border border-zinc-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-900">{t('dashboard.mps')}</h3>
          <div className="flex items-center gap-3">
            <select
              value={selectedSort}
              onChange={(e) => setSelectedSort(e.target.value as SortOption)}
              className="text-[10px] text-zinc-600 bg-transparent border border-zinc-200 rounded px-2 py-1 cursor-pointer hover:border-zinc-300 transition-colors focus:outline-none"
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <LocalizedLink
              to="/sejm/poslowie"
              className="text-[10px] text-zinc-400 hover:text-zinc-600 transition-colors"
            >
              {t('dashboard.all')} <i className="ri-arrow-right-s-line" />
            </LocalizedLink>
          </div>
        </div>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1">
          {topMPs.map((mp) => {
            const color = getPartyColor(mp.club);
            return (
              <LocalizedLink
                key={mp.id}
                to={`/sejm/poslowie/${mp.id}`}
                className="block rounded overflow-hidden border border-zinc-200 hover:border-zinc-300 transition-all"
              >
                <div className="relative aspect-[3/4]">
                  <img
                    src={mp.photoUrl}
                    alt={mp.firstLastName}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-1.5">
                    <p className="text-white text-[9px] font-medium leading-tight mb-0.5 line-clamp-2">
                      {mp.firstLastName}
                    </p>
                    <div className="flex items-center gap-1">
                      <span
                        className="w-1 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: color.bg }}
                      />
                      <span className="text-white/70 text-[7px] font-mono">
                        {getMpDisplayValue(mp, selectedSort, t)}
                      </span>
                    </div>
                  </div>
                </div>
              </LocalizedLink>
            );
          })}
        </div>
      </div>

      {/* Recent Votings */}
      <div className="rounded-lg border border-zinc-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-zinc-900">{t('dashboard.recentVotings')}</h3>
          <LocalizedLink
            to="/sejm/glosowania"
            className="text-xs text-zinc-500 hover:text-zinc-700"
          >
            {t('dashboard.allVotings')} <i className="ri-arrow-right-s-line" />
          </LocalizedLink>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {recentVotings.map((voting) => (
            <VotingCard key={voting.id || `${voting.sitting}-${voting.votingNumber}`} voting={voting} />
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <LocalizedLink
          to="/sejm/druki"
          className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center"
        >
          <i className="ri-file-text-line text-2xl text-zinc-600 mb-1" />
          <div className="text-sm font-medium text-zinc-900">{t('dashboard.prints')}</div>
          <div className="text-xs text-zinc-500">{t('dashboard.recent', { count: stats?.prints.recent || 0 })}</div>
        </LocalizedLink>
        <LocalizedLink
          to="/sejm/interpelacje"
          className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center"
        >
          <i className="ri-question-answer-line text-2xl text-zinc-600 mb-1" />
          <div className="text-sm font-medium text-zinc-900">{t('dashboard.interpellations')}</div>
          <div className="text-xs text-zinc-500">{t('dashboard.recent', { count: stats?.interpellations.recent || 0 })}</div>
        </LocalizedLink>
        <LocalizedLink
          to="/sejm/komisje"
          className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center"
        >
          <i className="ri-team-line text-2xl text-zinc-600 mb-1" />
          <div className="text-sm font-medium text-zinc-900">{t('dashboard.committees')}</div>
        </LocalizedLink>
        <LocalizedLink
          to="/sejm/transmisje"
          className="rounded-lg border border-zinc-200 p-4 hover:border-zinc-300 hover:bg-zinc-50 transition-all text-center"
        >
          <i className="ri-live-line text-2xl text-zinc-600 mb-1" />
          <div className="text-sm font-medium text-zinc-900">{t('dashboard.broadcasts')}</div>
        </LocalizedLink>
      </div>
    </div>
  );
}
