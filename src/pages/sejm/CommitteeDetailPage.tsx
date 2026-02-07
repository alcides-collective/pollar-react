import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useCommittee, useCommitteeSittings } from '../../hooks/useCommittees';
import { PartyBadge, SejmApiError } from '../../components/sejm';
import { useLanguageStore } from '../../stores/languageStore';

export function CommitteeDetailPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { code } = useParams<{ code: string }>();
  const { committee, loading, error } = useCommittee(code || null);
  const { sittings } = useCommitteeSittings(code || null);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-surface animate-pulse rounded" />
        <div className="h-32 bg-surface animate-pulse rounded-lg" />
      </div>
    );
  }

  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (!committee) {
    return (
      <div className="text-center py-12">
        <p className="text-content-subtle">{t('committeeDetail.notFound')}</p>
        <LocalizedLink to="/sejm/komisje" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('committeeDetail.backToList')}
        </LocalizedLink>
      </div>
    );
  }

  const typeLabels: Record<string, string> = {
    standing: t('committeeDetail.typeStanding'),
    extraordinary: t('committeeDetail.typeExtraordinary'),
    investigative: t('committeeDetail.typeInvestigative'),
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <LocalizedLink to="/sejm/komisje" className="text-sm text-content-subtle hover:text-content">
        <i className="ri-arrow-left-s-line" /> {t('committeeDetail.allCommittees')}
      </LocalizedLink>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-surface text-content text-sm font-mono px-2 py-0.5 rounded">
            {committee.code}
          </span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            committee.type === 'standing' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400' :
            committee.type === 'extraordinary' ? 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400' :
            'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
          }`}>
            {typeLabels[committee.type]}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-content-heading">{committee.name}</h1>
        {committee.scope && (
          <p className="text-content mt-2">{committee.scope}</p>
        )}
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        {committee.phone && (
          <div>
            <span className="text-content-subtle">{t('committeeDetail.phone')}:</span>
            <p className="text-content-heading">{committee.phone}</p>
          </div>
        )}
        {committee.appointmentDate && (
          <div>
            <span className="text-content-subtle">{t('committeeDetail.appointmentDate')}:</span>
            <p className="text-content-heading">{formatDate(committee.appointmentDate)}</p>
          </div>
        )}
      </div>

      {/* Presidium */}
      {committee.presidium && committee.presidium.length > 0 && (
        <div className="rounded-lg border border-divider p-4">
          <h2 className="text-sm font-medium text-content-heading mb-3">{t('committeeDetail.presidium')}</h2>
          <div className="space-y-2">
            {committee.presidium.map((member) => (
              <div key={member.id} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <LocalizedLink
                    to={`/sejm/poslowie/${member.id}`}
                    className="text-sm text-content-heading hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {member.firstLastName}
                  </LocalizedLink>
                  <PartyBadge club={member.club} size="sm" />
                </div>
                {member.function && (
                  <span className="text-xs text-content-subtle">{member.function}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members */}
      {committee.members && committee.members.length > 0 && (
        <div className="rounded-lg border border-divider p-4">
          <h2 className="text-sm font-medium text-content-heading mb-3">
            {t('committeeDetail.membersCount', { count: committee.members.length })}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {committee.members.map((member) => (
              <div key={member.id} className="flex items-center gap-2">
                <LocalizedLink
                  to={`/sejm/poslowie/${member.id}`}
                  className="text-sm text-content-heading hover:text-blue-600 dark:hover:text-blue-400"
                >
                  {member.firstLastName}
                </LocalizedLink>
                <PartyBadge club={member.club} size="sm" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent sittings */}
      {sittings.length > 0 && (
        <div className="rounded-lg border border-divider p-4">
          <h2 className="text-sm font-medium text-content-heading mb-3">{t('committeeDetail.recentSittings')}</h2>
          <div className="space-y-2">
            {sittings.slice(0, 5).map((sitting) => (
              <div key={sitting.num} className="flex items-start justify-between py-2 border-b border-divider-subtle last:border-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-content-faint">#{sitting.num}</span>
                    <span className="text-sm text-content-heading">{formatDate(sitting.date)}</span>
                  </div>
                  {sitting.agenda && (
                    <p className="text-xs text-content-subtle mt-1 line-clamp-2">{sitting.agenda}</p>
                  )}
                </div>
                {sitting.videoLink && (
                  <a
                    href={sitting.videoLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="shrink-0 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    {t('committeeDetail.video')} <i className="ri-arrow-right-s-line" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
