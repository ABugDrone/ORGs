import { useState, useCallback } from 'react';
import type { SearchQuery, SearchResults, SearchFilters, SearchOptions } from '@/types/search';
import { searchService } from '@/lib/search/searchService';

export function useSearch() {
  const [query, setQuery] = useState<string>('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [options, setOptions] = useState<SearchOptions>({ sortBy: 'relevance' });
  const [results, setResults] = useState<SearchResults>({
    documents: [],
    reports: [],
    messages: [],
    totalCounts: { documents: 0, reports: 0, messages: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Execute search with current query and filters
   */
  const executeSearch = useCallback(
    async (searchQuery?: string) => {
      setLoading(true);
      setError(null);

      try {
        const queryText = searchQuery !== undefined ? searchQuery : query;
        
        const searchQuery: SearchQuery = {
          text: queryText,
          filters,
          options,
        };

        const searchResults = searchService.search(searchQuery);
        setResults(searchResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Search failed');
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    },
    [query, filters, options]
  );

  /**
   * Update search query
   */
  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  /**
   * Update search filters
   */
  const updateFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Update search options
   */
  const updateOptions = useCallback((newOptions: SearchOptions) => {
    setOptions(newOptions);
  }, []);

  /**
   * Clear all filters
   */
  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setQuery('');
    setFilters({});
    setResults({
      documents: [],
      reports: [],
      messages: [],
      totalCounts: { documents: 0, reports: 0, messages: 0 },
    });
    setError(null);
  }, []);

  return {
    query,
    filters,
    options,
    results,
    loading,
    error,
    executeSearch,
    updateQuery,
    updateFilters,
    updateOptions,
    clearFilters,
    clearSearch,
  };
}
