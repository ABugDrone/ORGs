import { FileText, FileSpreadsheet, MessageSquare, ExternalLink, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { SearchResultItem } from '@/types/search';

interface SearchResultCardProps {
  result: SearchResultItem;
  query: string;
  onOpenSummary: () => void;
}

export function SearchResultCard({ result, query, onOpenSummary }: SearchResultCardProps) {
  const getIcon = () => {
    switch (result.type) {
      case 'document':
        return <FileText className="h-5 w-5" />;
      case 'report':
        return <FileSpreadsheet className="h-5 w-5" />;
      case 'message':
        return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getResultUrl = () => {
    switch (result.type) {
      case 'report':
        return `/reports/${result.id}`;
      case 'message':
        return `/messages`;
      case 'document':
      default:
        return result.url || '#';
    }
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} className="bg-yellow-200 dark:bg-yellow-800">{part}</mark>
      ) : (
        part
      )
    );
  };

  const snippet = result.snippet.length > 150
    ? result.snippet.substring(0, 150) + '...'
    : result.snippet;

  return (
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-3">
        <div className="text-muted-foreground mt-1">{getIcon()}</div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-lg">
            {highlightText(result.title, query)}
          </h3>
          <p className="text-sm text-muted-foreground">
            {highlightText(snippet, query)}
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline">{result.type}</Badge>
            {result.metadata.department && (
              <Badge variant="secondary">{result.metadata.department}</Badge>
            )}
            {result.metadata.date && (
              <span className="text-xs text-muted-foreground">
                {new Date(result.metadata.date).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" asChild>
              <Link to={getResultUrl()}>
                <ExternalLink className="h-4 w-4 mr-1" />
                Open
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={onOpenSummary}>
              <Sparkles className="h-4 w-4 mr-1" />
              AI Summary
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}
