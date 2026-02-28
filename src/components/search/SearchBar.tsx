import { useState, useEffect, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useSearchContext } from '@/context/SearchContext';
import { useNavigate } from 'react-router-dom';
import { AutosuggestionDropdown } from './AutosuggestionDropdown';
import { AutosuggestionService } from '@/lib/search/autosuggestionService';
import { SearchIndexService } from '@/lib/search/searchIndexService';

interface SearchSuggestion {
  text: string;
  type?: string;
}

const indexService = new SearchIndexService();
const autosuggestionService = new AutosuggestionService(indexService);

export function SearchBar() {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debouncedValue = useDebouncedValue(inputValue, 150);
  const { updateQuery, executeSearch } = useSearchContext();
  const navigate = useNavigate();

  const suggestions = useMemo(() => {
    if (debouncedValue.length < 2) return [];
    const rawSuggestions = autosuggestionService.generateSuggestions(debouncedValue);
    // Convert to simple format for dropdown
    return rawSuggestions.map(s => ({
      text: s.title,
      type: s.type === 'recent' ? 'recent' : s.type
    }));
  }, [debouncedValue]);

  useEffect(() => {
    updateQuery(debouncedValue);
    setShowSuggestions(debouncedValue.length >= 2);
  }, [debouncedValue, updateQuery]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      executeSearch(inputValue);
      autosuggestionService.addRecentSearch(inputValue);
      setShowSuggestions(false);
      navigate('/search');
    } else if (e.key === 'Escape') {
      setInputValue('');
      updateQuery('');
      setShowSuggestions(false);
    }
  };

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setInputValue(suggestion.text);
    executeSearch(suggestion.text);
    autosuggestionService.addRecentSearch(suggestion.text);
    setShowSuggestions(false);
    navigate('/search');
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search documents, reports..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        className="pl-9 pr-9"
      />
      {inputValue && (
        <button
          onClick={() => {
            setInputValue('');
            updateQuery('');
            setShowSuggestions(false);
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      )}
      <AutosuggestionDropdown
        suggestions={suggestions}
        query={inputValue}
        onSelect={handleSuggestionSelect}
        isOpen={showSuggestions}
      />
    </div>
  );
}
