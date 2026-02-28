import { FileText, FileSpreadsheet, MessageSquare, Clock } from 'lucide-react';

interface SearchSuggestion {
  text: string;
  type?: string;
}

interface AutosuggestionDropdownProps {
  suggestions: SearchSuggestion[];
  query: string;
  onSelect: (suggestion: SearchSuggestion) => void;
  isOpen: boolean;
}

export function AutosuggestionDropdown({
  suggestions,
  query,
  onSelect,
  isOpen
}: AutosuggestionDropdownProps) {
  if (!isOpen || suggestions.length === 0 || query.length < 2) {
    return null;
  }

  const getIcon = (type: string) => {
    switch (type) {
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'report':
        return <FileSpreadsheet className="h-4 w-4" />;
      case 'message':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;

    return (
      <>
        {text.substring(0, index)}
        <span className="font-semibold text-foreground">
          {text.substring(index, index + query.length)}
        </span>
        {text.substring(index + query.length)}
      </>
    );
  };

  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    const type = suggestion.type || 'recent';
    if (!acc[type]) acc[type] = [];
    acc[type].push(suggestion);
    return acc;
  }, {} as Record<string, SearchSuggestion[]>);

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
      {Object.entries(groupedSuggestions).map(([type, items]) => (
        <div key={type} className="py-2">
          <div className="px-3 py-1 text-xs font-semibold text-muted-foreground uppercase">
            {type === 'recent' ? 'Recent Searches' : `${type}s`}
          </div>
          {items.map((suggestion, idx) => (
            <button
              key={`${type}-${idx}`}
              onClick={() => onSelect(suggestion)}
              className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-2"
            >
              {getIcon(suggestion.type || 'recent')}
              <span className="text-sm">
                {highlightMatch(suggestion.text, query)}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}
