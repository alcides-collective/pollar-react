import type { SejmInterpellation, SejmMP } from '../../types/sejm';
import { LocalizedLink } from '../LocalizedLink';

interface InterpellationCardProps {
  interpellation: SejmInterpellation;
  mpsMap?: Map<number, SejmMP>;
  onClick?: () => void;
}

export function InterpellationCard({ interpellation, mpsMap, onClick }: InterpellationCardProps) {
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
      className="block w-full text-left rounded-lg border border-divider hover:border-divider hover:shadow-sm transition-all p-4"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <span className="shrink-0 bg-surface text-content text-xs font-mono px-2 py-0.5 rounded">
          #{interpellation.num}
        </span>
        <span
          className={`shrink-0 text-[10px] font-medium px-2 py-0.5 rounded ${
            hasReply
              ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400'
              : 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400'
          }`}
        >
          {hasReply ? 'Odpowiedziano' : 'Oczekuje'}
        </span>
      </div>

      <h3 className="text-sm font-medium text-content-heading leading-tight line-clamp-2 mb-2">
        {interpellation.title}
      </h3>

      <div className="text-[11px] text-content-subtle space-y-1">
        <div className="flex flex-wrap gap-x-1">
          <span className="text-content-faint">Od:</span>
          {interpellation.from.map((idStr, i) => {
            const id = parseInt(idStr, 10);
            const mp = mpsMap && !isNaN(id) ? mpsMap.get(id) : null;
            return (
              <span key={idStr}>
                {mp ? (
                  <LocalizedLink
                    to={`/sejm/poslowie/${id}`}
                    className="text-blue-600 dark:text-blue-400 hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {mp.firstLastName}
                  </LocalizedLink>
                ) : (
                  <span>{idStr}</span>
                )}
                {i < interpellation.from.length - 1 && ','}
              </span>
            );
          })}
        </div>
        <div>
          <span className="text-content-faint">Do:</span>{' '}
          {interpellation.to.join(', ')}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span>{formatDate(interpellation.sentDate)}</span>
          {hasReply && (
            <span className="text-green-600 dark:text-green-400">
              {interpellation.replies!.length} odpowiedzi
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
