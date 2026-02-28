import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface AISummaryButtonProps {
  onClick: () => void;
  hasCachedSummary?: boolean;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export function AISummaryButton({
  onClick,
  hasCachedSummary = false,
  size = 'sm',
  variant = 'outline'
}: AISummaryButtonProps) {
  return (
    <Button
      size={size}
      variant={variant}
      onClick={onClick}
      className={cn(
        hasCachedSummary && 'border-purple-500 text-purple-600 dark:text-purple-400'
      )}
    >
      <Sparkles className={cn(
        'mr-1',
        size === 'sm' && 'h-4 w-4',
        size === 'default' && 'h-5 w-5',
        hasCachedSummary && 'fill-purple-500'
      )} />
      AI Summary
    </Button>
  );
}
