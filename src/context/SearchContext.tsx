import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { SearchIndexService } from '@/lib/search/searchIndexService';
import { SearchService } from '@/lib/search/searchService';
import { SearchCacheService } from '@/lib/search/searchCacheService';
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

  // Initialize search index with existing content
  useEffect(() => {
    const initializeIndex = () => {
      // Get content from localStorage
      const workHistory = JSON.parse(localStorage.getItem('workHistory') || '[]');
      const reports = JSON.parse(localStorage.getItem('reports') || '[]');
      
      const indexedContent = [
        ...workHistory.map((entry: any) => ({
          id: entry.id,
          type: 'document' as const,
          title: entry.title || 'Untitled',
          content: entry.content || '',
          metadata: {
            department: entry.department,
            date: entry.date,
            format: entry.format || 'text'
          }
        })),
        ...reports.map((report: any) => ({
          id: report.id,
          type: 'report' as const,
          title: report.title,
          content: report.content || report.summary || '',
          metadata: {
            department: report.department,
            subdepartment: report.subdepartment,
            date: report.createdAt,
            tags: report.tags || []
          }
        }))
      ];

      indexService.buildIndex(indexedContent);
    };

    initializeIndex();
  }, []);

  const executeSearch = useCallback((searchQuery: string) => {
    setLoading(true);
    setQuery(searchQuery);

    // Simulate async search
    setTimeout(() => {
      const searchResults = searchService.search({
        text: searchQuery,
        filters,
        options: {}
      });
      
      // Flatten results from grouped structure
      const flatResults = [
        ...searchResults.documents,
        ...searchResults.reports,
        ...searchResults.messages
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
    clearFilters
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
