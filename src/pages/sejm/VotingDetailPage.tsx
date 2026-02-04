import { useParams, Link } from 'react-router-dom';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useVoting } from '../../hooks/useVoting';
import { useMPs } from '../../hooks/useMPs';
import { VotingResultBar, VoteIndicator, PartyBadge, SejmApiError } from '../../components/sejm';
import { useLanguageStore } from '../../stores/languageStore';

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
        <div className="h-6 w-32 bg-zinc-100 animate-pulse rounded" />
        <div className="h-8 w-3/4 bg-zinc-100 animate-pulse rounded" />
        <div className="h-24 bg-zinc-100 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!voting) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-500">{t('votingDetail.notFound')}</p>
        <Link to="/sejm/glosowania" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          <i className="ri-arrow-left-s-line" /> {t('votingDetail.backToList')}
        </Link>
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
      <Link to="/sejm/glosowania" className="text-sm text-zinc-500 hover:text-zinc-700">
        <i className="ri-arrow-left-s-line" /> {t('votingDetail.allVotings')}
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-sm text-zinc-500">
            {t('votingDetail.sittingVoting', { sitting: voting.sitting, number: voting.votingNumber })}
          </span>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded ${
              passed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}
          >
            {passed ? t('votingDetail.passed') : t('votingDetail.rejected')}
          </span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-900 mb-2">{voting.title}</h1>
        <p className="text-sm text-zinc-500">{formatDate(voting.date)}</p>
      </div>

      {/* Results */}
      <div className="rounded-lg border border-zinc-200 p-4">
        <VotingResultBar
          yes={voting.yes}
          no={voting.no}
          abstain={voting.abstain}
          notParticipating={voting.notParticipating}
          showNumbers={true}
          height="md"
        />

        <div className="grid grid-cols-4 gap-4 mt-4 text-center">
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="text-2xl font-semibold text-green-700">{voting.yes}</div>
            <div className="text-xs text-green-600">{t('votingDetail.for')}</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-semibold text-red-700">{voting.no}</div>
            <div className="text-xs text-red-600">{t('votingDetail.against')}</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg">
            <div className="text-2xl font-semibold text-amber-700">{voting.abstain}</div>
            <div className="text-xs text-amber-600">{t('votingDetail.abstained')}</div>
          </div>
          <div className="p-3 bg-zinc-50 rounded-lg">
            <div className="text-2xl font-semibold text-zinc-700">{voting.notParticipating}</div>
            <div className="text-xs text-zinc-600">{t('votingDetail.absent')}</div>
          </div>
        </div>
      </div>

      {/* Individual votes */}
      {voting.votes && voting.votes.length > 0 && (
        <div className="rounded-lg border border-zinc-200 p-4">
          <h2 className="text-sm font-medium text-zinc-900 mb-4">{t('votingDetail.individualVotes')}</h2>

          {/* Search and filter */}
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="text"
              placeholder={t('votingDetail.searchMP')}
              value={searchVoter}
              onChange={(e) => setSearchVoter(e.target.value)}
              className="flex-1 min-w-[200px] px-3 py-2 text-sm border border-zinc-200 rounded-md focus:outline-none focus:ring-2 focus:ring-zinc-300"
            />
            <select
              value={filterClub || ''}
              onChange={(e) => setFilterClub(e.target.value || null)}
              className="px-3 py-2 text-sm border border-zinc-200 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-zinc-300"
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
                  <span className="text-xs text-zinc-500">({votes.length})</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {votes.map((vote, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1.5 px-2 py-1 bg-zinc-50 rounded text-xs"
                    >
                      <VoteIndicator vote={vote.vote} size="sm" />
                      <span className="text-zinc-700">{vote.name}</span>
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
