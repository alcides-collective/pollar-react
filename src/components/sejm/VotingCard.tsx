import type { VotingListItem } from '../../types/sejm';
import { LocalizedLink } from '../LocalizedLink';
import { TitleWithDrukLinks } from '../../utils/druk-parser';

interface VotingCardProps {
  voting: VotingListItem;
}

export function VotingCard({ voting }: VotingCardProps) {
  const passed = voting.yes > voting.no;
  const total = voting.yes + voting.no + voting.abstain;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`h-full flex flex-col rounded-lg pt-4 px-4 pb-0 overflow-hidden border transition-all ${
      passed
        ? 'border-green-200 dark:border-green-800 bg-green-50/30 dark:bg-green-950/20 hover:border-green-300 dark:hover:border-green-700'
        : 'border-red-200 dark:border-red-800 bg-red-50/30 dark:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700'
    }`}>
      {/* Title with druk links */}
      <h3 className="text-content-heading text-sm leading-snug font-medium mb-1 break-words overflow-hidden">
        <TitleWithDrukLinks
          title={voting.title}
          linkClassName="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline font-mono"
        />
      </h3>

      {/* Meta pills */}
      <div className="flex items-center flex-wrap gap-1 mb-3">
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface text-content">
          Posiedzenie {voting.sitting}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface text-content">
          Głosowanie nr {voting.votingNumber}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-surface text-content">
          {formatDate(voting.date)}
        </span>
        <span
          className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
            passed
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
              : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400'
          }`}
        >
          {passed ? 'Przyjęte' : 'Odrzucone'}
        </span>
      </div>

      {/* Vote counts grid */}
      <div className="grid grid-cols-3 gap-2 mt-auto text-center">
        <div>
          <p className="text-lg font-mono text-green-600 dark:text-green-400">{voting.yes}</p>
          <p className="text-xs text-content-subtle">za</p>
        </div>
        <div>
          <p className="text-lg font-mono text-red-600 dark:text-red-400">{voting.no}</p>
          <p className="text-xs text-content-subtle">przeciw</p>
        </div>
        <div>
          <p className="text-lg font-mono text-amber-600 dark:text-amber-400">{voting.abstain}</p>
          <p className="text-xs text-content-subtle">wstrzym.</p>
        </div>
      </div>

      {/* Color bar - link to details */}
      <LocalizedLink
        to={`/sejm/glosowania/${voting.sitting}/${voting.votingNumber}`}
        className="-mx-4 h-3 flex mt-3 hover:h-4 transition-all"
      >
        {voting.yes > 0 && (
          <div
            style={{ width: `${(voting.yes / total) * 100}%` }}
            className="bg-green-500"
          />
        )}
        {voting.no > 0 && (
          <div
            style={{ width: `${(voting.no / total) * 100}%` }}
            className="bg-red-500"
          />
        )}
        {voting.abstain > 0 && (
          <div
            style={{ width: `${(voting.abstain / total) * 100}%` }}
            className="bg-amber-500"
          />
        )}
      </LocalizedLink>
    </div>
  );
}
