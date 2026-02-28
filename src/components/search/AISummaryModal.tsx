import { useEffect } from 'react';
import { Loader2, Copy, X, AlertCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAISummary } from '@/hooks/useAISummary';

interface AISummaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentId: string;
  contentType: 'document' | 'report' | 'message';
  content: string;
  title: string;
}

export function AISummaryModal({
  isOpen,
  onClose,
  contentId,
  contentType,
  content,
  title
}: AISummaryModalProps) {
  const { loading, summary, error, generateSummary, clearSummary } = useAISummary();
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && !summary && !loading) {
      generateSummary(contentId, contentType, content);
    }
  }, [isOpen, contentId, contentType, content, summary, loading, generateSummary]);

  useEffect(() => {
    if (!isOpen) {
      clearSummary();
    }
  }, [isOpen, clearSummary]);

  const handleCopyToClipboard = () => {
    if (summary) {
      const text = `${summary.summary}\n\n${summary.bulletPoints.map(p => `• ${p}`).join('\n')}`;
      navigator.clipboard.writeText(text);
      toast({
        title: 'Copied to clipboard',
        description: 'Summary has been copied to your clipboard'
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>AI-generated summary</DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Generating summary...</p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-destructive">{error}</p>
            <Button onClick={() => generateSummary(contentId, contentType, content)}>
              Retry
            </Button>
          </div>
        )}

        {summary && !loading && (
          <div className="space-y-4">
            <div className="prose dark:prose-invert max-w-none">
              <p className="text-sm text-muted-foreground">
                {summary.metadata.wordCount} words • {summary.metadata.readingTime} min read
              </p>
              <p className="mt-4">{summary.summary}</p>
              
              {summary.bulletPoints.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Key Points:</h4>
                  <ul className="space-y-1">
                    {summary.bulletPoints.map((point, idx) => (
                      <li key={idx}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleCopyToClipboard} variant="outline">
                <Copy className="h-4 w-4 mr-2" />
                Copy to Clipboard
              </Button>
              <Button onClick={onClose} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
