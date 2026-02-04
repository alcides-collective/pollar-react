import { useTranslation } from 'react-i18next';
import { TrendingUp } from 'lucide-react';
import type { PopularSearch } from '@/types/search';

interface PopularSearchesProps {
  searches: PopularSearch[];
  onSelect: (term: string) => void;
}

export function PopularSearches({ searches, onSelect }: PopularSearchesProps) {
  const { t } = useTranslation('search');

  if (searches.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500 dark:text-zinc-400">
        <TrendingUp className="size-4" />
        <span>{t('popularSearches')}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <button
            key={search.term}
            type="button"
            onClick={() => onSelect(search.term)}
            className="px-3 py-1.5 text-sm rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
          >
            {search.term}
          </button>
        ))}
      </div>
    </div>
  );
}
