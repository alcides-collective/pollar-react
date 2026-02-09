import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@/components/ui/dialog';
import { useSearch } from '@/hooks/useSearch';
import { SearchInput } from './SearchInput';
import { SearchResults } from './SearchResults';
import { PopularSearches } from './PopularSearches';
import { NoResults } from './NoResults';

export function SearchModal() {
  const { t } = useTranslation('common');
  const {
    isOpen,
    query,
    results,
    popularSearches,
    suggestions,
    isLoading,
    closeSearch,
    handleQueryChange,
    handleSelect,
    handlePopularSearch,
    handleSuggestion,
    clearSearch,
  } = useSearch();

  const showPopularSearches = !query && popularSearches.length > 0;
  const showNoResults = query.length >= 3 && !isLoading && results.length === 0;
  const showResults = results.length > 0;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent className="dark sm:max-w-2xl max-h-[80vh] p-0 gap-0 overflow-hidden" hideCloseButton>
        <DialogTitle className="sr-only">{t('nav.search')}</DialogTitle>

        <SearchInput
          value={query}
          onChange={handleQueryChange}
          onClear={() => {
            clearSearch();
          }}
          isLoading={isLoading}
        />

        <div className="overflow-y-auto max-h-[calc(80vh-80px)] p-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {showPopularSearches && (
            <PopularSearches
              searches={popularSearches}
              onSelect={handlePopularSearch}
            />
          )}

          {showResults && (
            <SearchResults
              results={results}
              isLoading={isLoading}
              onSelect={handleSelect}
            />
          )}

          {showNoResults && (
            <NoResults
              query={query}
              suggestions={suggestions}
              onSuggestionSelect={handleSuggestion}
            />
          )}

          {isLoading && !showResults && (
            <SearchResults
              results={[]}
              isLoading={true}
              onSelect={handleSelect}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
