import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMP } from '../../hooks/useMP';
import { PartyBadge, SejmApiError } from '../../components/sejm';
import { FollowMPButton } from '../../components/FollowMPButton';
import { useLanguageStore } from '../../stores/languageStore';

export function MPDetailPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { id } = useParams<{ id: string }>();
  const { mp, loading, error } = useMP(id ? parseInt(id) : null);

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
        <Link to="/sejm/poslowie" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('mpDetail.backToList')}
        </Link>
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
      <Link to="/sejm/poslowie" className="text-sm text-zinc-500 hover:text-zinc-700">
        <i className="ri-arrow-left-s-line" /> {t('mpDetail.allMPs')}
      </Link>

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

          {/* Stats grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-green-50 rounded-lg">
              <div className="text-xl font-semibold text-green-700">{mp.votingStats.votingsYes}</div>
              <div className="text-xs text-green-600">{t('mpDetail.for')}</div>
            </div>
            <div className="p-3 bg-red-50 rounded-lg">
              <div className="text-xl font-semibold text-red-700">{mp.votingStats.votingsNo}</div>
              <div className="text-xs text-red-600">{t('mpDetail.against')}</div>
            </div>
            <div className="p-3 bg-amber-50 rounded-lg">
              <div className="text-xl font-semibold text-amber-700">{mp.votingStats.votingsAbstain}</div>
              <div className="text-xs text-amber-600">{t('mpDetail.abstained')}</div>
            </div>
            <div className="p-3 bg-zinc-50 rounded-lg">
              <div className="text-xl font-semibold text-zinc-700">{mp.votingStats.votingsAbsent}</div>
              <div className="text-xs text-zinc-600">{t('mpDetail.absent')}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
