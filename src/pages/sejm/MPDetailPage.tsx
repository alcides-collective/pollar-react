import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useTranslation } from 'react-i18next';
import { useMP } from '../../hooks/useMP';
import { useMPVotings } from '../../hooks/useMPVotings';
import { PartyBadge, SejmApiError, VoteIndicator, VotingResultBar } from '../../components/sejm';
import { FollowMPButton } from '../../components/FollowMPButton';
import { useLanguageStore } from '../../stores/languageStore';
import { TitleWithDrukLinks } from '../../utils/druk-parser';

export function MPDetailPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { id } = useParams<{ id: string }>();
  const mpId = id ? parseInt(id) : null;
  const { mp, loading, error } = useMP(mpId);
  const { votings, loading: votingsLoading } = useMPVotings(mpId);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 bg-zinc-100 animate-pulse rounded" />
        <div className="flex gap-6">
          <div className="w-48 h-64 bg-zinc-100 animate-pulse rounded-lg" />
          <div className="flex-1 space-y-3">
            <div className="h-8 w-64 bg-zinc-100 animate-pulse rounded" />
            <div className="h-4 w-48 bg-zinc-100 animate-pulse rounded" />
            <div className="h-4 w-56 bg-zinc-100 animate-pulse rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!mp) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">{t('mpDetail.notFound')}</p>
        <LocalizedLink to="/sejm/poslowie" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
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

  return (
    <div className="space-y-6">
      {/* Back link */}
      <LocalizedLink to="/sejm/poslowie" className="text-sm text-zinc-500 hover:text-zinc-700">
        <i className="ri-arrow-left-s-line" /> {t('mpDetail.allMPs')}
      </LocalizedLink>

      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-6">
        <div className="sm:w-48 shrink-0">
          <img
            src={mp.photoUrl}
            alt={mp.firstLastName}
            className="w-full rounded-lg shadow-md"
          />
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-semibold text-zinc-900">{mp.firstLastName}</h1>
              {!mp.active && (
                <span className="bg-zinc-200 text-zinc-600 text-xs px-2 py-0.5 rounded">
                  {t('mpDetail.inactive')}
                </span>
              )}
            </div>
            <FollowMPButton mpId={mp.id} mpName={mp.firstLastName} />
          </div>

          <div className="flex items-center gap-3 mb-4">
            <PartyBadge club={mp.club} size="md" showFullName />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-500">{t('mpDetail.district')}:</span>
              <p className="text-zinc-900">{mp.districtName} ({mp.districtNum})</p>
            </div>
            <div>
              <span className="text-zinc-500">{t('mpDetail.voivodeship')}:</span>
              <p className="text-zinc-900">{mp.voivodeship}</p>
            </div>
            {mp.profession && (
              <div>
                <span className="text-zinc-500">{t('mpDetail.profession')}:</span>
                <p className="text-zinc-900">{mp.profession}</p>
              </div>
            )}
            {mp.educationLevel && (
              <div>
                <span className="text-zinc-500">{t('mpDetail.education')}:</span>
                <p className="text-zinc-900">{mp.educationLevel}</p>
              </div>
            )}
            {mp.birthDate && (
              <div>
                <span className="text-zinc-500">{t('mpDetail.birthDate')}:</span>
                <p className="text-zinc-900">{formatDate(mp.birthDate)}</p>
              </div>
            )}
            {mp.numberOfVotes && (
              <div>
                <span className="text-zinc-500">{t('mpDetail.numberOfVotes')}:</span>
                <p className="text-zinc-900 font-medium">{mp.numberOfVotes.toLocaleString(localeMap[language] || 'pl-PL')}</p>
              </div>
            )}
            {mp.email && (
              <div className="col-span-2">
                <span className="text-zinc-500">{t('mpDetail.email')}:</span>
                <p className="text-zinc-900">
                  <a href={`mailto:${mp.email}`} className="text-blue-600 hover:underline">
                    {mp.email}
                  </a>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Voting Stats */}
      {mp.votingStats && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-4">{t('mpDetail.votingStats')}</h2>

          {/* Attendance bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-zinc-600">{t('mpDetail.attendance')}</span>
              <span className="font-medium">{mp.votingStats.votingsAttendance.toFixed(1)}%</span>
            </div>
            <div className="h-2 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full"
                style={{ width: `${mp.votingStats.votingsAttendance}%` }}
              />
            </div>
          </div>

        </div>
      )}

      {/* Voting History */}
      <div className="rounded-lg border border-zinc-200 p-4">
        <h2 className="text-sm font-medium text-zinc-900 mb-4">{t('mpDetail.votingHistory')}</h2>

        {votingsLoading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-5 h-5 bg-zinc-100 animate-pulse rounded-full shrink-0" />
                <div className="flex-1 space-y-1">
                  <div className="h-4 bg-zinc-100 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-zinc-100 animate-pulse rounded w-1/4" />
                </div>
                <div className="w-24 h-2 bg-zinc-100 animate-pulse rounded shrink-0" />
              </div>
            ))}
          </div>
        ) : votings.length === 0 ? (
          <p className="text-sm text-zinc-500">{t('mpDetail.noVotings')}</p>
        ) : (
          <div className="space-y-2">
            {votings.map((v) => (
              <LocalizedLink
                key={`${v.sitting}-${v.votingNumber}`}
                to={`/sejm/glosowania/${v.sitting}/${v.votingNumber}`}
                className="flex items-start gap-3 p-2 -mx-2 rounded-md hover:bg-zinc-50 transition-colors"
              >
                <div className="mt-0.5 shrink-0">
                  <VoteIndicator vote={v.mpVote} size="md" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-zinc-900 leading-snug">
                    <TitleWithDrukLinks title={v.title} />
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
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
