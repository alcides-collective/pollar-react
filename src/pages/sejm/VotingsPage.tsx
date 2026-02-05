import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useVotings } from '../../hooks/useVotings';
import { VotingCard, SejmApiError } from '../../components/sejm';
import { TitleWithDrukLinks } from '../../utils/druk-parser';
import type { VotingListItem } from '../../types/sejm';

type FilterOption = 'all' | 'passed' | 'rejected';

type VotingStack = {
  key: string;
  pkt: string | null;
  sitting: number;
  votings: VotingListItem[];
};

// Extract "Pkt. X" from title
function getPktKey(voting: VotingListItem): string {
  const match = voting.title.match(/^Pkt\.\s*(\d+)/i);
  if (match) {
    return `${voting.sitting}-pkt-${match[1]}`;
  }
  return `${voting.sitting}-${voting.votingNumber}`;
}

// Get Pkt number from title
function getPktNumber(title: string): string | null {
  const match = title.match(/^Pkt\.\s*(\d+)/i);
  return match ? match[1] : null;
}

// Stack item component - handles both single and grouped votings
function StackItem({
  stack,
  isExpanded,
  onToggle,
  t,
}: {
  stack: VotingStack;
  isExpanded: boolean;
  onToggle: () => void;
  t: (key: string, options?: Record<string, unknown>) => string;
}) {
  // Single voting - full card
  if (stack.votings.length === 1) {
    return <VotingCard voting={stack.votings[0]} />;
  }

  // Grouped votings - card-like expandable
  const passedCount = stack.votings.filter(v => v.yes > v.no).length;
  const rejectedCount = stack.votings.filter(v => v.yes <= v.no).length;
  const totalYes = stack.votings.reduce((sum, v) => sum + v.yes, 0);
  const totalNo = stack.votings.reduce((sum, v) => sum + v.no, 0);
  const totalAbstain = stack.votings.reduce((sum, v) => sum + v.abstain, 0);
  const total = totalYes + totalNo + totalAbstain;
  const majorityPassed = passedCount > rejectedCount;

  return (
    <div className={`rounded-lg border transition-all overflow-hidden ${
      majorityPassed
        ? 'border-green-200 bg-green-50/30 hover:border-green-300'
        : 'border-red-200 bg-red-50/30 hover:border-red-300'
    }`}>
      {/* Header - card-like style */}
      <button
        onClick={onToggle}
        className="w-full text-left pt-4 px-4 hover:bg-zinc-50/50 transition-colors"
      >
        {/* Title */}
        <h3 className="text-zinc-900 text-sm leading-snug font-medium mb-1 break-words overflow-hidden">
          <TitleWithDrukLinks
            title={stack.votings[0].title}
            linkClassName="text-blue-600 hover:text-blue-800 hover:underline font-mono"
          />
        </h3>

        {/* Meta pills */}
        <div className="flex items-center flex-wrap gap-1 mb-3">
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 text-zinc-600">
            {t('votingsPage.sitting', { number: stack.sitting })}
          </span>
          <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 text-zinc-600">
            {t('votingsPage.votingsCount', { count: stack.votings.length })}
          </span>
          {passedCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-green-100 text-green-700">
              {t('votingsPage.passedCount', { count: passedCount })}
            </span>
          )}
          {rejectedCount > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] rounded font-medium bg-red-100 text-red-700">
              {t('votingsPage.rejectedCount', { count: rejectedCount })}
            </span>
          )}
          <i className={`ri-arrow-down-s-line text-zinc-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        </div>

        {/* Vote percentages grid - for groups show % not absolute */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-mono text-green-600">{Math.round((totalYes / total) * 100)}%</p>
            <p className="text-xs text-zinc-500">{t('votingsPage.for')}</p>
          </div>
          <div>
            <p className="text-lg font-mono text-red-600">{Math.round((totalNo / total) * 100)}%</p>
            <p className="text-xs text-zinc-500">{t('votingsPage.against')}</p>
          </div>
          <div>
            <p className="text-lg font-mono text-amber-600">{Math.round((totalAbstain / total) * 100)}%</p>
            <p className="text-xs text-zinc-500">{t('votingsPage.abstain')}</p>
          </div>
        </div>
      </button>

      {/* Color bar */}
      <div className="h-3 flex mt-3">
        {totalYes > 0 && (
          <div style={{ width: `${(totalYes / total) * 100}%` }} className="bg-green-500" />
        )}
        {totalNo > 0 && (
          <div style={{ width: `${(totalNo / total) * 100}%` }} className="bg-red-500" />
        )}
        {totalAbstain > 0 && (
          <div style={{ width: `${(totalAbstain / total) * 100}%` }} className="bg-amber-500" />
        )}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-zinc-200 bg-zinc-50/50">
          <div className="space-y-4 p-4">
            {stack.votings.map((voting) => (
              <VotingCard
                key={voting.id || `${voting.sitting}-${voting.votingNumber}`}
                voting={voting}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function VotingsPage() {
  const { t } = useTranslation('sejm');
  const { votings, total, hasMore, loading, loadingMore, loadMore, error } = useVotings();
  const [filter, setFilter] = useState<FilterOption>('all');
  const [expandedStacks, setExpandedStacks] = useState<Set<string>>(new Set());

  const filteredVotings = useMemo(() => {
    if (filter === 'all') return votings;
    if (filter === 'passed') return votings.filter(v => v.yes > v.no);
    return votings.filter(v => v.yes <= v.no);
  }, [votings, filter]);

  // Group votings by Pkt key
  const groupedVotings = useMemo(() => {
    const groups = new Map<string, VotingStack>();

    for (const voting of filteredVotings) {
      const key = getPktKey(voting);
      const pkt = getPktNumber(voting.title);

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          pkt,
          sitting: voting.sitting,
          votings: [],
        });
      }
      groups.get(key)!.votings.push(voting);
    }

    return Array.from(groups.values());
  }, [filteredVotings]);

  const toggleStack = (key: string) => {
    setExpandedStacks(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  if (error) {
    return <SejmApiError message={error.message} />;
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-12 bg-zinc-100 animate-pulse rounded-lg" />
        <div className="grid gap-3 md:grid-cols-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-zinc-100 animate-pulse rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters bar */}
      <div className="sticky top-0 z-10 backdrop-blur-sm rounded-lg p-4 border border-zinc-200 bg-white/80">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-zinc-900 text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200'
              }`}
            >
              {t('votingsPage.all')}
            </button>
            <button
              onClick={() => setFilter('passed')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'passed'
                  ? 'bg-green-600 text-white'
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
            >
              {t('votingsPage.passed')}
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-red-100 text-red-700 hover:bg-red-200'
              }`}
            >
              {t('votingsPage.rejected')}
            </button>
          </div>
          <p className="text-sm text-zinc-500">
            {t('votingsPage.found', { count: filteredVotings.length })}
          </p>
        </div>
      </div>

      {/* Votings list - Two-column Pinterest grid */}
      {filteredVotings.length === 0 ? (
        <p className="text-center text-zinc-500 py-8">
          {t('votingsPage.noResults')}
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
          {/* Left column */}
          <div className="space-y-4">
            {groupedVotings.filter((_, i) => i % 2 === 0).map((stack) => (
              <StackItem
                key={stack.key}
                stack={stack}
                isExpanded={expandedStacks.has(stack.key)}
                onToggle={() => toggleStack(stack.key)}
                t={t}
              />
            ))}
          </div>
          {/* Right column */}
          <div className="space-y-4">
            {groupedVotings.filter((_, i) => i % 2 === 1).map((stack) => (
              <StackItem
                key={stack.key}
                stack={stack}
                isExpanded={expandedStacks.has(stack.key)}
                onToggle={() => toggleStack(stack.key)}
                t={t}
              />
            ))}
          </div>
        </div>
      )}

      {/* Load more */}
      {hasMore && filter === 'all' && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            disabled={loadingMore}
            className="px-6 py-2 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-50 transition-colors disabled:opacity-50"
          >
            {loadingMore
              ? t('votingsPage.loading')
              : t('votingsPage.loadMoreCount', { loaded: votings.length, total: total || '?' })}
          </button>
        </div>
      )}
    </div>
  );
}
