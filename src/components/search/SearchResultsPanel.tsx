import { useState } from 'react';
import { Loader2, Search as SearchIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { SearchResultCard } from './SearchResultCard';
import { useSearchContext } from '@/context/SearchContext';
import type { SearchResultItem } from '@/types/search';

export function SearchResultsPanel({ onOpenSummary }: { onOpenSummary: (result: SearchResultItem) => void }) {
  const { results, loading, query } = useSearchContext();
  const [loadMoreCounts, setLoadMoreCounts] = useState<Record<string, number>>({
    document: 20,
    report: 20,
    message: 20
  });

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Searching...</span>
        </div>
        {[1, 2, 3].map(i => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-24 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!query) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground space-y-2">
          <SearchIcon className="h-12 w-12 mx-auto opacity-50" />
          <h3 className="text-lg font-semibold">Start searching</h3>
          <p className="text-sm">Enter a query to search across documents, reports, and messages</p>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center text-muted-foreground space-y-2">
          <SearchIcon className="h-12 w-12 mx-auto opacity-50" />
          <h3 className="text-lg font-semibold">No results found</h3>
          <p className="text-sm">Try different keywords or adjust your filters</p>
        </div>
      </div>
    );
  }

  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<string, SearchResultItem[]>);

  return (
    <div className="flex-1 p-6 space-y-6">
      <div className="text-sm text-muted-foreground">
        Found {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
      </div>

      {Object.entries(groupedResults).map(([type, items]) => {
        const displayCount = loadMoreCounts[type] || 20;
        const visibleItems = items.slice(0, displayCount);
        const hasMore = items.length > displayCount;

        return (
          <div key={type} className="space-y-4">
            <h2 className="text-xl font-semibold capitalize">
              {type}s ({items.length})
            </h2>
            <div className="space-y-3">
              {visibleItems.map((result) => (
                <SearchResultCard
                  key={result.id}
                  result={result}
                  query={query}
                  onOpenSummary={() => onOpenSummary(result)}
                />
              ))}
            </div>
            {hasMore && (
              <Button
                variant="outline"
                onClick={() => setLoadMoreCounts(prev => ({
                  ...prev,
                  [type]: prev[type] + 20
                }))}
              >
                Load More ({items.length - displayCount} remaining)
              </Button>
            )}
          </div>
        );
      })}
    </div>
  );
}
