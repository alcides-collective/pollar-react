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
        ? 'border-green-200 bg-green-50/30 hover:border-green-300'
        : 'border-red-200 bg-red-50/30 hover:border-red-300'
    }`}>
      {/* Title with druk links */}
      <h3 className="text-zinc-900 text-sm leading-snug font-medium mb-1">
        <TitleWithDrukLinks
          title={voting.title}
          linkClassName="text-blue-600 hover:text-blue-800 hover:underline font-mono"
        />
      </h3>

      {/* Meta pills */}
      <div className="flex items-center flex-wrap gap-1 mb-3">
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 text-zinc-600">
          Posiedzenie {voting.sitting}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 text-zinc-600">
          Głosowanie nr {voting.votingNumber}
        </span>
        <span className="px-1.5 py-0.5 text-[10px] rounded bg-zinc-100 text-zinc-600">
          {formatDate(voting.date)}
        </span>
        <span
          className={`px-1.5 py-0.5 text-[10px] rounded font-medium ${
            passed
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}
        >
          {passed ? 'Przyjęte' : 'Odrzucone'}
        </span>
      </div>

      {/* Vote counts grid */}
      <div className="grid grid-cols-3 gap-2 mt-auto text-center">
        <div>
          <p className="text-lg font-mono text-green-600">{voting.yes}</p>
          <p className="text-xs text-zinc-500">za</p>
        </div>
        <div>
          <p className="text-lg font-mono text-red-600">{voting.no}</p>
          <p className="text-xs text-zinc-500">przeciw</p>
        </div>
        <div>
          <p className="text-lg font-mono text-amber-600">{voting.abstain}</p>
          <p className="text-xs text-zinc-500">wstrzym.</p>
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
