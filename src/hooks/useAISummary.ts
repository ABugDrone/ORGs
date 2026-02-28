import { useState, useCallback } from 'react';
import { MockAIService } from '@/lib/search/mockAIService';
import type { AISummary } from '@/types/search';

const aiService = new MockAIService();

interface UseAISummaryReturn {
  loading: boolean;
  summary: AISummary | null;
  error: string | null;
  generateSummary: (contentId: string, contentType: 'document' | 'report' | 'message', content: string) => Promise<void>;
  clearSummary: () => void;
}

export function useAISummary(): UseAISummaryReturn {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<AISummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = useCallback(async (
    contentId: string,
    contentType: 'document' | 'report' | 'message',
    content: string
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await aiService.generateSummary(contentId, contentType, content);
      setSummary(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate summary');
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSummary = useCallback(() => {
    setSummary(null);
    setError(null);
  }, []);

  return {
    loading,
    summary,
    error,
    generateSummary,
    clearSummary
  };
}
