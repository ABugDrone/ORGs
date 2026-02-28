import type { AISummary, ContentType } from '@/types/search';

export class MockAIService {
  private summaryCache: Map<string, AISummary> = new Map();
  private delay = 2000; // 2 seconds

  /**
   * Generate AI summary for content
   */
  async generateSummary(
    contentId: string,
    contentTitle: string,
    contentType: ContentType,
    content: string
  ): Promise<AISummary> {
    // Check cache
    if (this.summaryCache.has(contentId)) {
      return this.summaryCache.get(contentId)!;
    }

    // Simulate 2-second processing delay
    await this.simulateDelay(this.delay);

    // Generate mock summary
    const summary = this.createMockSummary(
      contentId,
      contentTitle,
      contentType,
      content
    );

    // Cache result
    this.summaryCache.set(contentId, summary);

    return summary;
  }

  /**
   * Check if content has been summarized
   */
  hasSummary(contentId: string): boolean {
    return this.summaryCache.has(contentId);
  }

  /**
   * Clear summary cache
   */
  clearCache(): void {
    this.summaryCache.clear();
  }

  /**
   * Create mock summary from content
   */
  private createMockSummary(
    contentId: string,
    contentTitle: string,
    type: ContentType,
    content: string
  ): AISummary {
    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / 200); // 200 words per minute

    // Extract key sentences (simple heuristic)
    const sentences = content
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 20);

    const keyPoints = sentences.slice(0, 5).filter(Boolean);

    const summaryText = this.generateSummaryText(type, keyPoints, contentTitle);

    return {
      contentId,
      contentTitle,
      summary: summaryText,
      bulletPoints:
        keyPoints.length > 0 ? keyPoints : this.getDefaultBulletPoints(type),
      generatedAt: new Date(),
      metadata: {
        wordCount,
        readingTime: `${readingTime} min read`,
      },
    };
  }

  /**
   * Generate summary text based on content type
   */
  private generateSummaryText(
    type: ContentType,
    keyPoints: string[],
    title: string
  ): string {
    const intro = this.getSummaryIntro(type, title);

    if (keyPoints.length > 0) {
      const points = keyPoints.slice(0, 3).join('. ');
      return `${intro} ${points}.`;
    }

    return `${intro} This content provides valuable information and insights.`;
  }

  /**
   * Get summary introduction based on content type
   */
  private getSummaryIntro(type: ContentType, title: string): string {
    const intros = {
      document: `This document "${title}" covers`,
      report: `This report "${title}" analyzes`,
      message: `This conversation "${title}" discusses`,
    };
    return intros[type] || `This content "${title}" includes`;
  }

  /**
   * Get default bullet points for content type
   */
  private getDefaultBulletPoints(type: ContentType): string[] {
    const defaults = {
      document: [
        'Key information and documentation',
        'Important details and specifications',
        'Relevant context and background',
      ],
      report: [
        'Performance metrics and analysis',
        'Key findings and insights',
        'Recommendations and next steps',
      ],
      message: [
        'Main discussion topics',
        'Action items and decisions',
        'Follow-up requirements',
      ],
    };
    return defaults[type] || ['Summary not available'];
  }

  /**
   * Simulate processing delay
   */
  private simulateDelay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Singleton instance
export const mockAIService = new MockAIService();
