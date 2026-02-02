import { cn } from '@/lib/utils';

interface DaneSourceFooterProps {
  source: string;
  sourceUrl?: string;
  className?: string;
}

export function DaneSourceFooter({
  source,
  sourceUrl,
  className,
}: DaneSourceFooterProps) {
  return (
    <div
      className={cn(
        'text-xs text-muted-foreground pt-4 border-t mt-6',
        className
      )}
    >
      Źródło:{' '}
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          {source}
        </a>
      ) : (
        <span>{source}</span>
      )}
    </div>
  );
}
