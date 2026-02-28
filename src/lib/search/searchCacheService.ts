import type { SearchQuery, SearchResults } from '@/types/search';

interface CacheEntry {
  results: SearchResults;
  timestamp: number;
}

export class SearchCacheService {
  private cache: Map<string, CacheEntry>;
  private maxSize: number = 100;
  private ttl: number = 5 * 60 * 1000; // 5 minutes

  constructor(maxSize: number = 100, ttlMinutes: number = 5) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Get cached search results
   */
  get(key: string): SearchResults | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if entry has expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    // Move to end (LRU - most recently used)
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.results;
  }

  /**
   * Set cache entry
   */
  set(key: string, results: SearchResults): void {
    // Evict oldest entry if cache is full (LRU)
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      results,
      timestamp: Date.now(),
    });
  }

  /**
   * Generate cache key from search query
   */
  generateKey(query: SearchQuery): string {
    return JSON.stringify({
      text: query.text,
      filters: query.filters,
      options: query.options,
    });
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove expired entries
   */
  cleanExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    size: number;
    maxSize: number;
    ttl: number;
  } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      ttl: this.ttl,
    };
  }
}

// Singleton instance
export const searchCacheService = new SearchCacheService();
