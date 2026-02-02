import type { SearchResult } from '@/types/search';
import { SearchResultItem } from './SearchResultItem';
import { Loader2 } from 'lucide-react';

interface SearchResultsProps {
  results: SearchResult[];
  isLoading: boolean;
  onSelect: (result: SearchResult) => void;
}

export function SearchResults({ results, isLoading, onSelect }: SearchResultsProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="size-6 animate-spin text-zinc-400" />
        <span className="ml-2 text-zinc-500">Szukam...</span>
      </div>
    );
  }

  if (results.length === 0) {
    return null;
  }

  return (
    <div className="space-y-1">
      {results.map((result) => (
        <SearchResultItem
          key={`${result.type}-${result.id}`}
          result={result}
          onClick={() => onSelect(result)}
        />
      ))}
    </div>
  );
}
