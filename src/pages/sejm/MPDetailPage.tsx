import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useMP } from '../../hooks/useMP';
import { useMPVotings } from '../../hooks/useMPVotings';
import { PartyBadge, SejmApiError, VoteIndicator, VotingResultBar } from '../../components/sejm';
import { FollowMPButton } from '../../components/FollowMPButton';
import { useLanguageStore } from '../../stores/languageStore';
import { TitleWithDrukLinks } from '../../utils/druk-parser';
import { getPartyColor, getPartyName } from '../../types/sejm';
import { useDocumentHead } from '../../hooks/useDocumentHead';
import { createSlug } from '../../utils/slug';

export function MPDetailPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const navigate = useNavigate();
  const { id, slug } = useParams<{ id: string; slug?: string }>();
  const mpId = id ? parseInt(id) : null;
  const { mp, loading, error } = useMP(mpId);
  const { votings, loading: votingsLoading } = useMPVotings(mpId);

  // Slug redirect — canonical URL with name slug
  useEffect(() => {
    if (!mp || !id) return;
    const expectedSlug = createSlug(mp.firstLastName);
    if (expectedSlug && slug !== expectedSlug) {
      navigate(`/sejm/poslowie/${id}/${expectedSlug}`, { replace: true });
    }
  }, [mp, id, slug, navigate]);

  // SEO meta tags
  const partyFullName = mp ? getPartyName(mp.club) : '';
  const attendance = mp?.votingStats?.votingsAttendance;
  const seoDescription = mp
    ? [
        `${mp.firstLastName}, ${partyFullName}.`,
        `Okręg ${mp.districtNum} ${mp.districtName}, woj. ${mp.voivodeship}.`,
        attendance != null ? `Frekwencja: ${attendance.toFixed(1)}%.` : '',
      ].filter(Boolean).join(' ')
    : '';

  useDocumentHead({
    title: mp ? `${mp.firstLastName} — Poseł ${mp.club}` : undefined,
    description: seoDescription || undefined,
    ogImage: mp ? `/api/og?title=${encodeURIComponent(mp.firstLastName)}&type=mp&description=${encodeURIComponent(partyFullName)}` : undefined,
    keywords: mp
      ? [mp.firstLastName, mp.club, partyFullName, mp.districtName, mp.voivodeship, 'Sejm', 'poseł'].filter(Boolean)
      : undefined,
  });

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-5 w-24 bg-surface animate-pulse rounded" />
        <div className="rounded-lg border border-divider overflow-hidden">
          <div className="h-28 sm:h-36 bg-surface animate-pulse" />
          <div className="px-4 sm:px-6 pb-4">
            <div className="flex items-end gap-4 -mt-14 sm:-mt-16">
              <div className="w-28 h-28 sm:w-32 sm:h-32 bg-muted animate-pulse rounded-lg border-4 border-card" />
              <div className="flex-1 space-y-2 pb-1">
                <div className="h-6 w-48 bg-surface animate-pulse rounded" />
                <div className="h-4 w-32 bg-surface animate-pulse rounded" />
              </div>
            </div>
            <div className="mt-4 flex gap-4">
              <div className="h-4 w-24 bg-surface animate-pulse rounded" />
              <div className="h-4 w-20 bg-surface animate-pulse rounded" />
              <div className="h-4 w-28 bg-surface animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!mp) {
    return (
      <div className="text-center py-12">
        <p className="text-content-subtle">{t('mpDetail.notFound')}</p>
        <LocalizedLink to="/sejm/poslowie" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('mpDetail.backToList')}
        </LocalizedLink>
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

  const partyColor = getPartyColor(mp.club);

  return (
    <div className="space-y-6">
      {/* Back link */}
      <LocalizedLink to="/sejm/poslowie" className="text-sm text-content-subtle hover:text-content mb-2 inline-block">
        <i className="ri-arrow-left-s-line" /> {t('mpDetail.allMPs')}
      </LocalizedLink>

      {/* Cover + Profile Card */}
      <div className="rounded-lg border border-divider overflow-hidden">
        {/* Party color cover */}
        <div
          className="h-28 sm:h-36 relative"
          style={{ backgroundColor: partyColor.bg }}
        >
          <div className="absolute inset-0 opacity-[0.08]" style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 20px, rgba(255,255,255,0.5) 20px, rgba(255,255,255,0.5) 22px)',
          }} />
        </div>

        {/* Profile section overlapping the cover */}
        <div className="px-4 sm:px-6 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-14 sm:-mt-16">
            {/* Photo */}
            <img
              src={mp.photoUrl}
              alt={mp.firstLastName}
              className="w-28 h-28 sm:w-32 sm:h-32 rounded-lg border-4 border-card object-cover shadow-md relative z-10"
            />

            {/* Name + party + follow */}
            <div className="flex-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:pb-1">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-semibold text-content-heading">{mp.firstLastName}</h1>
                  {!mp.active && (
                    <span className="bg-divider text-content text-xs px-2 py-0.5 rounded">
                      {t('mpDetail.inactive')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <PartyBadge club={mp.club} size="sm" showFullName />
                  <span className="text-xs text-content-subtle">{mp.districtName} ({mp.districtNum})</span>
                </div>
              </div>
              <FollowMPButton mpId={mp.id} mpName={mp.firstLastName} />
            </div>
          </div>

          {/* Compact details row */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-content">
            <span><i className="ri-map-pin-2-line text-content-subtle mr-1" />{mp.voivodeship}</span>
            {mp.profession && (
              <span><i className="ri-briefcase-line text-content-subtle mr-1" />{mp.profession}</span>
            )}
            {mp.educationLevel && (
              <span><i className="ri-graduation-cap-line text-content-subtle mr-1" />{mp.educationLevel}</span>
            )}
            {mp.birthDate && (
              <span><i className="ri-cake-2-line text-content-subtle mr-1" />{formatDate(mp.birthDate)}</span>
            )}
            {mp.numberOfVotes && (
              <span><i className="ri-bar-chart-box-line text-content-subtle mr-1" />{mp.numberOfVotes.toLocaleString(localeMap[language] || 'pl-PL')} {t('mpDetail.numberOfVotes').toLowerCase()}</span>
            )}
            {mp.email && (
              <a href={`mailto:${mp.email}`} className="text-blue-600 dark:text-blue-400 hover:underline">
                <i className="ri-mail-line mr-1" />{mp.email}
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Voting Stats */}
      {mp.votingStats && (
        <div className="rounded-lg border border-divider p-4">
          <h2 className="text-sm font-medium text-content-heading mb-4">{t('mpDetail.votingStats')}</h2>

          {/* Attendance bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-content">{t('mpDetail.attendance')}</span>
              <span className="font-medium">{mp.votingStats.votingsAttendance.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-surface rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${mp.votingStats.votingsAttendance}%` }}
              />
            </div>
          </div>

        </div>
      )}

      {/* Voting History */}
      <div className="rounded-lg border border-divider p-4">
        <h2 className="text-sm font-medium text-content-heading mb-4">{t('mpDetail.votingHistory')}</h2>

        {votingsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-surface animate-pulse rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-surface animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-surface animate-pulse rounded w-1/4" />
                </div>
                <div className="w-24 h-2 bg-surface animate-pulse rounded shrink-0" />
              </div>
            ))}
          </div>
        ) : votings.length === 0 ? (
          <p className="text-sm text-content-subtle">{t('mpDetail.noVotings')}</p>
        ) : (
          <div className="space-y-2">
            {votings.map((v) => (
              <LocalizedLink
                key={`${v.sitting}-${v.votingNumber}`}
                to={`/sejm/glosowania/${v.sitting}/${v.votingNumber}`}
                className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-muted transition-colors"
              >
                <div className="mt-0.5 shrink-0">
                  <VoteIndicator vote={v.mpVote} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-content-heading leading-snug">
                    <TitleWithDrukLinks title={v.title} />
                  </div>
                  <div className="text-xs text-content-faint mt-0.5">
                    {formatDate(v.date)}
                  </div>
                </div>
                <div className="w-24 shrink-0 mt-1">
                  <VotingResultBar yes={v.yes} no={v.no} abstain={v.abstain} showNumbers={false} height="sm" />
                </div>
              </LocalizedLink>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
