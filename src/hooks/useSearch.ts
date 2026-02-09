import { useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSearchStore } from '../stores/searchStore';
import { trackSearchResultClicked } from '../lib/analytics';
import { useUser } from '../stores/authStore';
import type { SearchResult } from '../types/search';

const DEBOUNCE_MS = 300;

export function useSearch() {
  const navigate = useNavigate();
  const store = useSearchStore();
  const user = useUser();
  const debounceTimerRef = useRef<number | null>(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Handle query change with debounce
  const handleQueryChange = useCallback(
    (query: string) => {
      store.setQuery(query);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // Set new debounced search
      if (query.length >= 3) {
        debounceTimerRef.current = window.setTimeout(() => {
          store.search(query);
        }, DEBOUNCE_MS);
      } else {
        // Clear results for short queries
        store.clearSearch();
        store.setQuery(query);
      }
    },
    [store]
  );

  // Handle result selection - close modal and navigate
  const handleSelect = useCallback(
    (result: SearchResult, index?: number) => {
      if (user) {
        trackSearchResultClicked({
          query: store.query,
          result_id: result.id || '',
          position: index ?? 0,
        });
      }
      store.closeSearch();
      store.clearSearch();
      // Append ?ref=search so EventPage knows the navigation source
      const separator = result.url.includes('?') ? '&' : '?';
      navigate(`${result.url}${separator}ref=search`);
    },
    [store, navigate, user]
  );

  // Handle popular search selection
  const handlePopularSearch = useCallback(
    (term: string) => {
      store.setQuery(term);
      store.search(term);
    },
    [store]
  );

  // Handle suggestion selection
  const handleSuggestion = useCallback(
    (suggestion: string) => {
      store.setQuery(suggestion);
      store.search(suggestion);
    },
    [store]
  );

  return {
    // State
    isOpen: store.isOpen,
    query: store.query,
    results: store.results,
    popularSearches: store.popularSearches,
    suggestions: store.suggestions,
    isLoading: store.isLoading,
    error: store.error,

    // Actions
    openSearch: store.openSearch,
    closeSearch: store.closeSearch,
    handleQueryChange,
    handleSelect,
    handlePopularSearch,
    handleSuggestion,
    clearSearch: store.clearSearch,
  };
}
