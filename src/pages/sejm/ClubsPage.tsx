import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useClubs } from '../../hooks/useClubs';
import { getPartyColor } from '../../types/sejm';
import { SejmApiError } from '../../components/sejm';

export function ClubsPage() {
  const { t } = useTranslation('sejm');
  const { clubs, loading, error } = useClubs();

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-zinc-100 animate-pulse rounded" />
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 bg-zinc-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  // Sort by member count descending
  const sortedClubs = [...clubs].sort((a, b) => b.membersCount - a.membersCount);
  const totalMembers = 460;

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-zinc-900">{t('clubsPage.title')}</h1>

      <div className="grid gap-4 md:grid-cols-2">
        {sortedClubs.map((club) => {
          const color = getPartyColor(club.id);
          const percentage = (club.membersCount / totalMembers) * 100;

          return (
            <LocalizedLink
              key={club.id}
              to={`/sejm/kluby/${club.id}`}
              className="block overflow-hidden rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all p-4"
            >
              <div className="flex items-center gap-4">
                {club.logoUrl && (
                  <img
                    src={club.logoUrl}
                    alt={club.name}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-zinc-900 truncate">{club.name}</h3>
                  <p className="text-sm text-zinc-500">{club.membersCount} {t('clubsPage.mps')}</p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: color.bg,
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-400 mt-1">
                  {percentage.toFixed(1)}% {t('clubsPage.mandates')}
                </p>
              </div>
            </LocalizedLink>
          );
        })}
      </div>
    </div>
  );
}
