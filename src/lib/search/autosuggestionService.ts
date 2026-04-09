import type { SearchSuggestion, IndexedContent } from '@/types/search';
import { SearchIndexService } from './searchIndexService';

export class AutosuggestionService {
  private recentSearches: string[] = [];
  private maxRecentSearches = 10;
  private maxSuggestions = 10;

  constructor(private indexService: SearchIndexService) {
    // Load recent searches from localStorage
    this.loadRecentSearches();
  }

  /**
   * Generate search suggestions based on query
   */
  generateSuggestions(query: string, limit: number = 10): SearchSuggestion[] {
    if (query.length < 2) {
      return [];
    }

    const suggestions: SearchSuggestion[] = [];
    const lowerQuery = query.toLowerCase();

    // Add recent searches that match
    const recentMatches = this.recentSearches
      .filter((search) => search.toLowerCase().includes(lowerQuery))
      .slice(0, 3);

    for (const search of recentMatches) {
      suggestions.push({
        id: `recent-${search}`,
        type: 'recent',
        title: search,
        subtitle: 'Recent search',
      });
    }

    // Add content matches using prefix search
    const contentMatches = this.indexService.findByPrefix(
      query,
      limit - suggestions.length
    );

    for (const item of contentMatches) {
      if (suggestions.length >= limit) break;

      suggestions.push({
        id: item.id,
        type: 'content',
        title: item.fields.title,
        subtitle: `${item.type} • ${item.fields.department}`,
        matchedText: this.getMatchedText(item.fields.title, query),
      });
    }

    // Limit to max suggestions
    return suggestions.slice(0, Math.min(limit, this.maxSuggestions));
  }

  /**
   * Add search to recent searches
   */
  addRecentSearch(query: string): void {
    if (!query.trim()) return;

    // Remove if already exists
    this.recentSearches = this.recentSearches.filter((s) => s !== query);

    // Add to beginning
    this.recentSearches.unshift(query);

    // Limit size
    if (this.recentSearches.length > this.maxRecentSearches) {
      this.recentSearches = this.recentSearches.slice(0, this.maxRecentSearches);
    }

    // Save to localStorage
    this.saveRecentSearches();
  }

  /**
   * Get recent searches
   */
  getRecentSearches(): string[] {
    return [...this.recentSearches];
  }

  /**
   * Clear recent searches
   */
  clearRecentSearches(): void {
    this.recentSearches = [];
    this.saveRecentSearches();
  }

  /**
   * Get matched text portion for highlighting
   */
  private getMatchedText(title: string, query: string): string {
    const lowerTitle = title.toLowerCase();
    const lowerQuery = query.toLowerCase();
    const index = lowerTitle.indexOf(lowerQuery);

    if (index !== -1) {
      return title.substring(index, index + query.length);
    }

    return query;
  }

  /**
   * Load recent searches from localStorage
   */
  private loadRecentSearches(): void {
    try {
      const stored = localStorage.getItem('orgs_recent_searches');
      if (stored) {
        this.recentSearches = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load recent searches:', error);
      this.recentSearches = [];
    }
  }

  /**
   * Save recent searches to localStorage
   */
  private saveRecentSearches(): void {
    try {
      localStorage.setItem('orgs_recent_searches', JSON.stringify(this.recentSearches));
    } catch (error) {
      console.error('Failed to save recent searches:', error);
    }
  }
}

// Create singleton instance
import { searchIndexService } from './searchIndexService';

export const autosuggestionService = new AutosuggestionService(searchIndexService);
