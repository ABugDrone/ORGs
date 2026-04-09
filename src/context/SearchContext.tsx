import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { SearchIndexService } from '@/lib/search/searchIndexService';
import { SearchService } from '@/lib/search/searchService';
import { SearchCacheService } from '@/lib/search/searchCacheService';
import { fileIndexService } from '@/lib/fileIndex/fileIndexService';
import type { SearchFilters, SearchResultItem } from '@/types/search';

interface SearchContextValue {
  query: string;
  filters: SearchFilters;
  results: SearchResultItem[];
  loading: boolean;
  executeSearch: (searchQuery: string) => void;
  updateQuery: (query: string) => void;
  updateFilters: (filters: Partial<SearchFilters>) => void;
  clearFilters: () => void;
}

const SearchContext = createContext<SearchContextValue | undefined>(undefined);

const indexService = new SearchIndexService();
const cacheService = new SearchCacheService();
const searchService = new SearchService(indexService, cacheService);

interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState<SearchFilters>({});
  const [results, setResults] = useState<SearchResultItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize search index with existing content using correct orgs_ keys
  useEffect(() => {
    const initializeIndex = () => {
      // Use correct namespaced key 'orgs_work_entries'
      const workEntries = JSON.parse(localStorage.getItem('orgs_work_entries') || '[]');

      // Also include files from fileIndexService (the IndexedDB source of truth)
      const indexedFiles = fileIndexService.getAll();

      const indexedContent = [
        ...workEntries.map((entry: any) => ({
          id: entry.id,
          type: 'document' as const,
          title: entry.name || entry.title || 'Untitled',
          content: entry.content || '',
          metadata: {
            department: '',
            date: entry.date || entry.createdAt,
            format: entry.format || 'text',
          },
        })),
        ...indexedFiles.map(file => ({
          id: file.id,
          type: 'document' as const,
          title: file.name,
          content: '',
          metadata: {
            department: '',
            date: file.uploadedAt,
            format: file.extension,
          },
        })),
      ];

      indexService.buildIndex(indexedContent);
    };

    initializeIndex();
  }, []);

  const executeSearch = useCallback((searchQuery: string) => {
    setLoading(true);
    setQuery(searchQuery);

    setTimeout(() => {
      const searchResults = searchService.search({
        text: searchQuery,
        filters,
        options: {},
      });

      const flatResults = [
        ...searchResults.documents,
        ...searchResults.reports,
        ...searchResults.messages,
      ];

      setResults(flatResults);
      setLoading(false);
    }, 100);
  }, [filters]);

  const updateQuery = useCallback((newQuery: string) => {
    setQuery(newQuery);
  }, []);

  const updateFilters = useCallback((newFilters: Partial<SearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  const value: SearchContextValue = {
    query,
    filters,
    results,
    loading,
    executeSearch,
    updateQuery,
    updateFilters,
    clearFilters,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearchContext() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearchContext must be used within a SearchProvider');
  }
  return context;
}
