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
      <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 uppercase tracking-wider">
        <TrendingUp className="size-3.5" />
        <span>{t('popularSearches')}</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <button
            key={search.term}
            type="button"
            onClick={() => onSelect(search.term)}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/10 text-zinc-300 hover:bg-white/15 hover:text-white border border-white/5 hover:border-white/10 transition-all duration-150"
          >
            {search.term}
          </button>
        ))}
      </div>
    </div>
  );
}
