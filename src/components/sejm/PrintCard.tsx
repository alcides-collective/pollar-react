import type { SejmPrint } from '../../types/sejm';
import { LocalizedLink } from '../LocalizedLink';

interface PrintCardProps {
  print: SejmPrint;
}

export function PrintCard({ print }: PrintCardProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('pl-PL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <LocalizedLink
      to={`/sejm/druki/${print.number}`}
      className="block rounded-lg border border-zinc-200 hover:border-zinc-300 hover:shadow-sm transition-all p-4"
    >
      <div className="flex items-start gap-3 mb-2">
        <span className="shrink-0 bg-zinc-100 text-zinc-600 text-xs font-mono px-2 py-0.5 rounded">
          {print.number}
        </span>
        {print.documentType && (
          <span className="text-[10px] text-zinc-500 uppercase tracking-wide">
            {print.documentType}
          </span>
        )}
      </div>

      <h3 className="text-sm font-medium text-zinc-900 leading-tight line-clamp-2 mb-2">
        {print.title}
      </h3>

      <div className="flex items-center justify-between text-[11px] text-zinc-500">
        <span>{formatDate(print.deliveryDate)}</span>
        {print.attachments && print.attachments.length > 0 && (
          <span className="flex items-center gap-1">
            <i className="ri-attachment-line text-xs" />
            {print.attachments.length}
          </span>
        )}
      </div>
    </LocalizedLink>
  );
}
