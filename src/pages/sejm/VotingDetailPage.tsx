import { useParams } from 'react-router-dom';
import { LocalizedLink } from '@/components/LocalizedLink';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoting } from '../../hooks/useVoting';
import { useMPs } from '../../hooks/useMPs';
import { VotingResultBar, VoteIndicator, PartyBadge, SejmApiError } from '../../components/sejm';
import { useLanguageStore } from '../../stores/languageStore';
import { TitleWithDrukLinks } from '../../utils/druk-parser';

export function VotingDetailPage() {
  const { t } = useTranslation('sejm');
  const language = useLanguageStore((s) => s.language);
  const { sitting, number } = useParams<{ sitting: string; number: string }>();
  const { voting, loading, error } = useVoting(
    sitting ? parseInt(sitting) : null,
    number ? parseInt(number) : null
  );
  const { mps } = useMPs();
  const [searchVoter, setSearchVoter] = useState('');
  const [filterClub, setFilterClub] = useState<string | null>(null);

  const mpMap = useMemo(() => {
    const map = new Map<number, typeof mps[0]>();
    mps.forEach(mp => map.set(mp.id, mp));
    return map;
  }, [mps]);

  const votesByClub = useMemo(() => {
    if (!voting?.votes) return {};

    const grouped: Record<string, typeof voting.votes> = {};
    voting.votes.forEach(vote => {
      const mp = mpMap.get(vote.MP);
      const club = vote.club || mp?.club || t('votingDetail.undefined');
      if (!grouped[club]) grouped[club] = [];
      grouped[club].push({
        ...vote,
        name: vote.name || mp?.firstLastName || t('votingDetail.mpLabel', { id: vote.MP }),
      });
    });

    // Sort clubs by size
    return Object.fromEntries(
      Object.entries(grouped).sort(([, a], [, b]) => b.length - a.length)
    );
  }, [voting?.votes, mpMap, t]);

  const filteredVotes = useMemo(() => {
    let result = { ...votesByClub };

    if (filterClub) {
      result = { [filterClub]: result[filterClub] || [] };
    }

    if (searchVoter) {
      const search = searchVoter.toLowerCase();
      Object.keys(result).forEach(club => {
        result[club] = result[club].filter(v =>
          v.name?.toLowerCase().includes(search)
        );
      });
      // Remove empty clubs
      Object.keys(result).forEach(club => {
        if (result[club].length === 0) delete result[club];
      });
    }

    return result;
  }, [votesByClub, searchVoter, filterClub]);

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-32 bg-surface animate-pulse rounded" />
        <div className="h-8 w-3/4 bg-surface animate-pulse rounded" />
        <div className="h-24 bg-surface animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="text-center py-12">
        <p className="text-content-subtle">{t('votingDetail.notFound')}</p>
        <LocalizedLink to="/sejm/glosowania" className="text-sm text-blue-600 dark:text-blue-400 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('votingDetail.backToList')}
        </LocalizedLink>
      </div>
    );
  }

  const passed = voting.yes > voting.no;
  const localeMap: Record<string, string> = { pl: 'pl-PL', en: 'en-US', de: 'de-DE' };
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(localeMap[language] || 'pl-PL', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Back link */}
      <LocalizedLink to="/sejm/glosowania" className="text-sm text-content-subtle hover:text-content">
        <i className="ri-arrow-left-s-line" /> {t('votingDetail.allVotings')}
      </LocalizedLink>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-content-subtle">
            {t('votingDetail.sittingVoting', { sitting: voting.sitting, number: voting.votingNumber })}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              passed ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
            }`}
          >
            {passed ? t('votingDetail.passed') : t('votingDetail.rejected')}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-content-heading mb-2 break-words">
          <TitleWithDrukLinks
            title={voting.title}
            linkClassName="text-blue-600 dark:text-blue-400 hover:underline font-mono"
          />
        </h1>
        <p className="text-sm text-content-subtle">{formatDate(voting.date)}</p>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-divider p-4">
        <VotingResultBar
          yes={voting.yes}
          no={voting.no}
          abstain={voting.abstain}
          notParticipating={voting.notParticipating}
          showNumbers={true}
          height="md"
        />

        <div className="grid grid-cols-4 gap-4 mt-4 text-center">
          <div className="p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
            <div className="text-2xl font-semibold text-green-700 dark:text-green-400">{voting.yes}</div>
            <div className="text-xs text-green-600 dark:text-green-500">{t('votingDetail.for')}</div>
          </div>
          <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <div className="text-2xl font-semibold text-red-700 dark:text-red-400">{voting.no}</div>
            <div className="text-xs text-red-600 dark:text-red-500">{t('votingDetail.against')}</div>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <div className="text-2xl font-semibold text-amber-700 dark:text-amber-400">{voting.abstain}</div>
            <div className="text-xs text-amber-600 dark:text-amber-500">{t('votingDetail.abstained')}</div>
          </div>
          <div className="p-3 bg-surface rounded-lg">
            <div className="text-2xl font-semibold text-content">{voting.notParticipating}</div>
            <div className="text-xs text-content">{t('votingDetail.absent')}</div>
          </div>
        </div>
      </div>

      {/* Individual votes */}
      {voting.votes && voting.votes.length > 0 && (
        <div className="rounded-lg border border-divider p-4">
          <h2 className="text-sm font-medium text-content-heading mb-4">{t('votingDetail.individualVotes')}</h2>

          {/* Search and filter */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder={t('votingDetail.searchMP')}
              value={searchVoter}
              onChange={(e) => setSearchVoter(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-divider rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <select
              value={filterClub || ''}
              onChange={(e) => setFilterClub(e.target.value || null)}
              className="px-3 py-2 text-sm border border-divider rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="">{t('votingDetail.allClubs')}</option>
              {Object.keys(votesByClub).map((club) => (
                <option key={club} value={club}>{club}</option>
              ))}
            </select>
          </div>

          {/* Votes by club */}
          <div className="space-y-4">
            {Object.entries(filteredVotes).map(([club, votes]) => (
              <div key={club}>
                <div className="flex items-center gap-2 mb-2">
                  <PartyBadge club={club} size="sm" />
                  <span className="text-xs text-content-subtle">({votes.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {votes.map((vote, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 bg-surface rounded text-xs"
                    >
                      <VoteIndicator vote={vote.vote} size="sm" />
                      <span className="text-content">{vote.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
