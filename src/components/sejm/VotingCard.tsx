import type { VotingListItem } from '../../types/sejm';
import { LocalizedLink } from '../LocalizedLink';

interface VotingCardProps {
  voting: VotingListItem;
}

// Parse title and extract druk references for linking
function parseTitle(title: string): { text: string; drukNr?: string }[] {
  const pattern = /\(?(druk[i]?\s+nr\s+)([\d\s,i]+)\)?/gi;
  const parts: { text: string; drukNr?: string }[] = [];
  let lastIndex = 0;
  let match;

  while ((match = pattern.exec(title)) !== null) {
    // Add text before the match
    if (match.index > lastIndex) {
      parts.push({ text: title.slice(lastIndex, match.index) });
    }

    // Parse the druk numbers
    const numbersStr = match[2];
    const numbers = numbersStr.split(/[,i\s]+/).filter(n => /^\d+$/.test(n.trim()));

    // Add prefix
    const hasOpenParen = title[match.index] === '(';
    if (hasOpenParen) parts.push({ text: '(' });
    parts.push({ text: match[1] });

    // Add each number as a link
    numbers.forEach((num, i) => {
      if (i > 0) {
        if (numbersStr.includes(',')) {
          parts.push({ text: ', ' });
        } else {
          parts.push({ text: ' i ' });
        }
      }
      parts.push({ text: num.trim(), drukNr: num.trim() });
    });

    // Check for closing paren
    if (match[0].endsWith(')')) {
      parts.push({ text: ')' });
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < title.length) {
    parts.push({ text: title.slice(lastIndex) });
  }

  return parts.length > 0 ? parts : [{ text: title }];
}

export function VotingCard({ voting }: VotingCardProps) {
  const passed = voting.yes > voting.no;
  const total = voting.yes + voting.no + voting.abstain;
  const titleParts = parseTitle(voting.title);

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
        {titleParts.map((part, i) =>
          part.drukNr ? (
            <LocalizedLink
              key={i}
              to={`/sejm/druki/${part.drukNr}`}
              className="text-zinc-600 hover:text-zinc-900 underline decoration-zinc-300 hover:decoration-zinc-500 font-mono"
              onClick={(e) => e.stopPropagation()}
            >
              {part.text}
            </LocalizedLink>
          ) : (
            <span key={i}>{part.text}</span>
          )
        )}
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
