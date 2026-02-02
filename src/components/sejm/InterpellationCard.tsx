import type { SejmInterpellation } from '../../types/sejm';

interface InterpellationCardProps {
  interpellation: SejmInterpellation;
  onClick?: () => void;
}

export function InterpellationCard({ interpellation, onClick }: InterpellationCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const hasReply = interpellation.replies && interpellation.replies.length > 0;

  return (
    <button
      onClick={onClick}
      className="block w-full text-left rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="shrink-0 bg-zinc-100 text-zinc-600 text-xs font-mono px-2 py-0.5 rounded">
          #{interpellation.num}
        </span>
        <span
          className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${
            hasReply
              ? 'bg-green-100 text-green-700'
              : 'bg-amber-100 text-amber-700'
          }`}
        >
          {hasReply ? 'Odpowiedziano' : 'Oczekuje'}
        </span>
      </div>

      <h3 className="text-sm font-medium text-zinc-900 leading-tight line-clamp-2 mb-2">
        {interpellation.title}
      </h3>

      <div className="text-[11px] text-zinc-500 space-y-1">
        <div>
          <span className="text-zinc-400">Od:</span>{' '}
          {interpellation.from.join(', ')}
        </div>
        <div>
          <span className="text-zinc-400">Do:</span>{' '}
          {interpellation.to.join(', ')}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span>{formatDate(interpellation.sentDate)}</span>
          {hasReply && (
            <span className="text-green-600">
              {interpellation.replies!.length} odpowiedzi
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
