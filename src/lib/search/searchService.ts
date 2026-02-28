import type {
  SearchQuery,
  SearchResults,
  SearchResult,
  SearchResultItem,
  IndexedContent,
  SearchFilters,
} from '@/types/search';
import { SearchIndexService } from './searchIndexService';
import { SearchCacheService } from './searchCacheService';

export class SearchService {
  constructor(
    private indexService: SearchIndexService,
    private cacheService: SearchCacheService
  ) {}

  /**
   * Execute search with filters and caching
   */
  search(query: SearchQuery): SearchResults {
    // Check cache first
    const cacheKey = this.cacheService.generateKey(query);
    const cached = this.cacheService.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Execute search
    const allContent = this.indexService.getAllContent();
    let results = this.searchContent(query.text, allContent);

    // Apply filters
    results = this.applyFilters(results, query.filters);

    // Rank by relevance
    results.sort((a, b) => b.score - a.score);

    // Apply pagination
    const limit = query.options.limit || 20;
    const offset = query.options.offset || 0;
    results = results.slice(offset, offset + limit);

    // Convert to SearchResults format
    const searchResults = this.formatResults(results);

    // Cache results
    this.cacheService.set(cacheKey, searchResults);

    return searchResults;
  }

  /**
   * Search content with relevance scoring
   */
  private searchContent(
    queryText: string,
    content: IndexedContent[]
  ): SearchResult[] {
    if (!queryText.trim()) {
      // Return all content with neutral score for empty query
      return content.map((item) => ({
        item,
        score: 0,
        matches: [],
        snippet: this.generateSnippet(item, ''),
      }));
    }

    const queryTokens = this.tokenize(queryText);
    const results: SearchResult[] = [];

    for (const item of content) {
      const score = this.calculateRelevanceScore(item, queryTokens);
      if (score > 0) {
        const matches = this.findMatches(item, queryTokens);
        const snippet = this.generateSnippet(item, queryText);
        results.push({ item, score, matches, snippet });
      }
    }

    return results;
  }

  /**
   * Calculate relevance score using TF-IDF inspired algorithm
   */
  private calculateRelevanceScore(
    item: IndexedContent,
    queryTokens: string[]
  ): number {
    let score = 0;

    for (const token of queryTokens) {
      // Title matches (weight: 3x)
      const titleMatches = this.countMatches(
        item.fields.title.toLowerCase(),
        token
      );
      score += titleMatches * 3;

      // Description matches (weight: 2x)
      if (item.fields.description) {
        const descMatches = this.countMatches(
          item.fields.description.toLowerCase(),
          token
        );
        score += descMatches * 2;
      }

      // Tag matches (weight: 2x)
      for (const tag of item.fields.tags) {
        const tagMatches = this.countMatches(tag.toLowerCase(), token);
        score += tagMatches * 2;
      }

      // Content matches (weight: 1x)
      const contentMatches = this.countMatches(
        item.searchableText.toLowerCase(),
        token
      );
      score += contentMatches * 1;

      // Exact match bonus
      if (item.fields.title.toLowerCase().includes(token)) {
        score += 5;
      }

      // Prefix match bonus
      if (item.fields.title.toLowerCase().startsWith(token)) {
        score += 3;
      }
    }

    // Recency boost (newer content scores higher)
    const daysOld = Math.floor(
      (Date.now() - item.fields.date.getTime()) / (1000 * 60 * 60 * 24)
    );
    const recencyBoost = 1 / (daysOld + 1) * 10;
    score += recencyBoost;

    return score;
  }

  /**
   * Apply filters to search results
   */
  private applyFilters(
    results: SearchResult[],
    filters: SearchFilters
  ): SearchResult[] {
    return results.filter((result) => {
      const item = result.item;

      // Name filter
      if (
        filters.name &&
        !item.fields.title.toLowerCase().includes(filters.name.toLowerCase())
      ) {
        return false;
      }

      // File ID filter
      if (
        filters.fileId &&
        item.fields.fileId !== filters.fileId
      ) {
        return false;
      }

      // Format filter
      if (
        filters.formats &&
        filters.formats.length > 0 &&
        (!item.fields.format ||
          !filters.formats.includes(item.fields.format))
      ) {
        return false;
      }

      // Department filter
      if (
        filters.departmentIds &&
        filters.departmentIds.length > 0 &&
        !filters.departmentIds.includes(item.fields.department)
      ) {
        return false;
      }

      // Date range filter
      if (filters.dateRange) {
        const itemDate = new Date(item.fields.date);
        if (
          itemDate < filters.dateRange.start ||
          itemDate > filters.dateRange.end
        ) {
          return false;
        }
      }

      // Content type filter
      if (
        filters.contentTypes &&
        filters.contentTypes.length > 0 &&
        !filters.contentTypes.includes(item.type)
      ) {
        return false;
      }

      return true;
    });
  }

  /**
   * Format search results into grouped structure
   */
  private formatResults(results: SearchResult[]): SearchResults {
    const documents: SearchResultItem[] = [];
    const reports: SearchResultItem[] = [];
    const messages: SearchResultItem[] = [];

    for (const result of results) {
      const item: SearchResultItem = {
        id: result.item.id,
        type: result.item.type,
        title: result.item.fields.title,
        snippet: result.snippet,
        metadata: {
          author: result.item.fields.author,
          department: result.item.fields.department,
          date: result.item.fields.date.toISOString(),
          format: result.item.fields.format,
        },
        relevanceScore: result.score,
        matchedFields: result.matches.map((m) => m.field),
      };

      switch (result.item.type) {
        case 'document':
          documents.push(item);
          break;
        case 'report':
          reports.push(item);
          break;
        case 'message':
          messages.push(item);
          break;
      }
    }

    return {
      documents,
      reports,
      messages,
      totalCounts: {
        documents: documents.length,
        reports: reports.length,
        messages: messages.length,
      },
    };
  }

  /**
   * Find matches in content
   */
  private findMatches(
    item: IndexedContent,
    queryTokens: string[]
  ): Array<{ field: string; value: string; indices: [number, number][] }> {
    const matches: Array<{
      field: string;
      value: string;
      indices: [number, number][];
    }> = [];

    for (const token of queryTokens) {
      // Check title
      const titleIndices = this.findIndices(
        item.fields.title.toLowerCase(),
        token
      );
      if (titleIndices.length > 0) {
        matches.push({
          field: 'title',
          value: item.fields.title,
          indices: titleIndices,
        });
      }

      // Check description
      if (item.fields.description) {
        const descIndices = this.findIndices(
          item.fields.description.toLowerCase(),
          token
        );
        if (descIndices.length > 0) {
          matches.push({
            field: 'description',
            value: item.fields.description,
            indices: descIndices,
          });
        }
      }
    }

    return matches;
  }

  /**
   * Generate snippet from content
   */
  private generateSnippet(item: IndexedContent, query: string): string {
    const maxLength = 150;
    let text = item.fields.description || item.searchableText || item.fields.title;

    if (!query.trim()) {
      return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
    }

    // Try to find query in text and show context
    const lowerText = text.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerText.indexOf(lowerQuery);

    if (index !== -1) {
      const start = Math.max(0, index - 50);
      const end = Math.min(text.length, index + query.length + 100);
      let snippet = text.substring(start, end);

      if (start > 0) snippet = '...' + snippet;
      if (end < text.length) snippet = snippet + '...';

      return snippet;
    }

    return text.substring(0, maxLength) + (text.length > maxLength ? '...' : '');
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .split(/\W+/)
      .filter((t) => t.length > 1)
      .filter(Boolean);
  }

  /**
   * Count matches of token in text
   */
  private countMatches(text: string, token: string): number {
    const regex = new RegExp(token, 'gi');
    const matches = text.match(regex);
    return matches ? matches.length : 0;
  }

  /**
   * Find indices of token in text
   */
  private findIndices(text: string, token: string): [number, number][] {
    const indices: [number, number][] = [];
    let index = text.indexOf(token);

    while (index !== -1) {
      indices.push([index, index + token.length]);
      index = text.indexOf(token, index + 1);
    }

    return indices;
  }
}

// Create singleton instance
import { searchIndexService } from './searchIndexService';
import { searchCacheService } from './searchCacheService';

export const searchService = new SearchService(
  searchIndexService,
  searchCacheService
);
