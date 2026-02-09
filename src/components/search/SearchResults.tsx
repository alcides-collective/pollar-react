import { useTranslation } from 'react-i18next';
import type { SearchResult } from '@/types/search';
import { SearchResultItem } from './SearchResultItem';
import { Loader2 } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelect: (result: SearchResult, index?: number) => void;
}

export function SearchResults({ results, isLoading, onSelect }: SearchResultsProps) {
  const { t } = useTranslation('search');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-5 animate-spin text-content-subtle" />
        <span className="ml-2 text-content-faint">{t('searching')}</span>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {results.map((result, index) => (
        <SearchResultItem
          key={`${result.type}-${result.id}`}
          result={result}
          onClick={() => onSelect(result, index)}
        />
      ))}
    </div>
  );
}
