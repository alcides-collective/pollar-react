import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useClub } from '../../hooks/useClubs';
import { useMPs } from '../../hooks/useMPs';
import { MPCard, SejmApiError } from '../../components/sejm';

export function ClubDetailPage() {
  const { t } = useTranslation('sejm');
  const { id } = useParams<{ id: string }>();
  const { club, loading, error } = useClub(id || null);
  const { mps } = useMPs();

  // Filter MPs by club
  const clubMPs = mps.filter(mp => mp.club === id);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-surface animate-pulse rounded" />
        <div className="h-24 bg-surface animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-1">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[3/4] bg-surface animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!club) {
    return (
      <div className="text-center py-12">
        <p className="text-content-subtle">{t('clubDetail.notFound')}</p>
        <LocalizedLink to="/sejm/kluby" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('clubDetail.backToList')}
        </LocalizedLink>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <LocalizedLink to="/sejm/kluby" className="text-sm text-content-subtle hover:text-content">
        <i className="ri-arrow-left-s-line" /> {t('clubDetail.allClubs')}
      </LocalizedLink>

      {/* Header */}
      <div className="flex items-center gap-4">
        {club.logoUrl && (
          <img
            src={club.logoUrl}
            alt={club.name}
            className="w-16 h-16 object-contain"
          />
        )}
        <div>
          <h1 className="text-xl font-semibold text-content-heading">{club.name}</h1>
          <p className="text-content-subtle">{t('clubDetail.membersCount', { count: club.membersCount })}</p>
        </div>
      </div>

      {/* Contact info */}
      {(club.email || club.phone || club.fax) && (
        <div className="rounded-lg border border-divider p-4">
          <h2 className="text-sm font-medium text-content-heading mb-3">{t('clubDetail.contact')}</h2>
          <div className="space-y-2 text-sm">
            {club.email && (
              <div>
                <span className="text-content-subtle">{t('clubDetail.email')}:</span>{' '}
                <a href={`mailto:${club.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                  {club.email}
                </a>
              </div>
            )}
            {club.phone && (
              <div>
                <span className="text-content-subtle">{t('clubDetail.phone')}:</span>{' '}
                <span className="text-content-heading">{club.phone}</span>
              </div>
            )}
            {club.fax && (
              <div>
                <span className="text-content-subtle">{t('clubDetail.fax')}:</span>{' '}
                <span className="text-content-heading">{club.fax}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Members */}
      <div>
        <h2 className="text-sm font-medium text-content-heading mb-4">
          {t('clubDetail.members')} ({clubMPs.length})
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12 gap-1">
          {clubMPs.map((mp) => (
            <MPCard key={mp.id} mp={mp} />
          ))}
        </div>
      </div>
    </div>
  );
}
