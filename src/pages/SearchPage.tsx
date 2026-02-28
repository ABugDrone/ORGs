import { useState } from 'react';
import { SearchFilters } from '@/components/search/SearchFilters';
import { SearchResultsPanel } from '@/components/search/SearchResultsPanel';
import { AISummaryModal } from '@/components/search/AISummaryModal';
import type { SearchResultItem } from '@/types/search';

export default function SearchPage() {
  const [summaryModalOpen, setSummaryModalOpen] = useState(false);
  const [selectedResult, setSelectedResult] = useState<SearchResultItem | null>(null);

  const handleOpenSummary = (result: SearchResultItem) => {
    setSelectedResult(result);
    setSummaryModalOpen(true);
  };

  return (
    <div className="flex h-full">
      <SearchFilters />
      <SearchResultsPanel onOpenSummary={handleOpenSummary} />
      
      {selectedResult && (
        <AISummaryModal
          isOpen={summaryModalOpen}
          onClose={() => setSummaryModalOpen(false)}
          contentId={selectedResult.id}
          contentType={selectedResult.type}
          content={selectedResult.snippet}
          title={selectedResult.title}
        />
      )}
    </div>
  );
}
