import { useTranslation } from 'react-i18next';
import { Newspaper, User, Vote, FileText, Users } from 'lucide-react';
import type { SearchResult, SearchResultType } from '@/types/search';
import { cn } from '@/lib/utils';

const TYPE_CONFIG: Record<SearchResultType, { icon: React.ElementType; color: string }> = {
  event: { icon: Newspaper, color: 'text-blue-500' },
  mp: { icon: User, color: 'text-green-500' },
  voting: { icon: Vote, color: 'text-purple-500' },
  print: { icon: FileText, color: 'text-orange-500' },
  committee: { icon: Users, color: 'text-teal-500' },
};

interface SearchResultItemProps {
  result: SearchResult;
  onClick: () => void;
}

export function SearchResultItem({ result, onClick }: SearchResultItemProps) {
  const { t } = useTranslation('search');
  const config = TYPE_CONFIG[result.type];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-start gap-3 p-3 rounded-lg text-left',
        'hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2'
      )}
    >
      <div className={cn('mt-0.5 p-2 rounded-md bg-zinc-100 dark:bg-zinc-800', config.color)}>
        <Icon className="size-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="font-medium text-zinc-900 dark:text-zinc-100 line-clamp-2">
          {result.title}
        </div>

        {result.subtitle && (
          <div className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
            {result.subtitle}
          </div>
        )}

        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            {t(`resultTypes.${result.type}`)}
          </span>
          {result.metadata?.category && (
            <>
              <span className="text-xs text-zinc-300 dark:text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {result.metadata.category}
              </span>
            </>
          )}
          {result.metadata?.club && (
            <>
              <span className="text-xs text-zinc-300 dark:text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {result.metadata.club}
              </span>
            </>
          )}
          {result.metadata?.date && (
            <>
              <span className="text-xs text-zinc-300 dark:text-zinc-600">•</span>
              <span className="text-xs text-zinc-400 dark:text-zinc-500">
                {new Date(result.metadata.date).toLocaleDateString('pl-PL')}
              </span>
            </>
          )}
        </div>
      </div>
    </button>
  );
}
