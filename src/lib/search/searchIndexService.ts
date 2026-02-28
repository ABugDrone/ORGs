import type {
  SearchIndex,
  IndexedContent,
  IndexedDocument,
  IndexedReport,
  IndexedMessage,
  ContentItem,
  ContentType,
} from '@/types/search';

export class SearchIndexService {
  private index: SearchIndex;
  private invertedIndex: Map<string, Set<string>>; // token → content IDs

  constructor() {
    this.index = {
      documents: new Map(),
      reports: new Map(),
      messages: new Map(),
      metadata: {
        lastUpdated: new Date(),
        totalItems: 0,
        version: '1.0.0',
      },
    };
    this.invertedIndex = new Map();
  }

  /**
   * Build search index from content items
   */
  buildIndex(items: ContentItem[]): void {
    // Clear existing index
    this.index.documents.clear();
    this.index.reports.clear();
    this.index.messages.clear();
    this.invertedIndex.clear();

    for (const item of items) {
      const tokens = this.tokenize(item);
      const indexed = this.createIndexedContent(item, tokens);

      // Store in appropriate map
      const typeMap = this.getMapForType(item.type);
      typeMap.set(item.id, indexed as any);

      // Build inverted index
      for (const token of tokens) {
        if (!this.invertedIndex.has(token)) {
          this.invertedIndex.set(token, new Set());
        }
        this.invertedIndex.get(token)!.add(item.id);
      }
    }

    this.index.metadata.lastUpdated = new Date();
    this.index.metadata.totalItems = items.length;
  }

  /**
   * Find content by prefix for autosuggestion
   */
  findByPrefix(prefix: string, limit: number = 10): IndexedContent[] {
    const lowerPrefix = prefix.toLowerCase();
    const results: IndexedContent[] = [];

    // Search across all content types
    const allMaps = [
      this.index.documents,
      this.index.reports,
      this.index.messages,
    ];

    for (const map of allMaps) {
      for (const item of map.values()) {
        if (results.length >= limit) break;

        // Check if title starts with prefix
        if (item.fields.title.toLowerCase().startsWith(lowerPrefix)) {
          results.push(item);
        }
      }
      if (results.length >= limit) break;
    }

    return results;
  }

  /**
   * Update index incrementally with new/updated item
   */
  updateItem(item: ContentItem): void {
    const tokens = this.tokenize(item);
    const indexed = this.createIndexedContent(item, tokens);

    // Remove old inverted index entries if item exists
    this.removeFromInvertedIndex(item.id);

    // Update item in appropriate map
    const typeMap = this.getMapForType(item.type);
    typeMap.set(item.id, indexed as any);

    // Update inverted index
    for (const token of tokens) {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token)!.add(item.id);
    }

    this.index.metadata.lastUpdated = new Date();
    this.index.metadata.totalItems = this.getTotalItems();
  }

  /**
   * Remove item from index
   */
  removeItem(id: string, type: ContentType): void {
    const typeMap = this.getMapForType(type);
    typeMap.delete(id);
    this.removeFromInvertedIndex(id);

    this.index.metadata.lastUpdated = new Date();
    this.index.metadata.totalItems = this.getTotalItems();
  }

  /**
   * Get the search index
   */
  getIndex(): SearchIndex {
    return this.index;
  }

  /**
   * Get inverted index for token-based search
   */
  getInvertedIndex(): Map<string, Set<string>> {
    return this.invertedIndex;
  }

  /**
   * Get all indexed content as array
   */
  getAllContent(): IndexedContent[] {
    return [
      ...Array.from(this.index.documents.values()),
      ...Array.from(this.index.reports.values()),
      ...Array.from(this.index.messages.values()),
    ];
  }

  /**
   * Tokenize content item into searchable tokens
   */
  private tokenize(item: ContentItem): string[] {
    const text = [
      item.title || '',
      item.description || '',
      ...(item.tags || []),
      item.content || '',
      item.author || '',
      item.department || '',
    ]
      .join(' ')
      .toLowerCase();

    // Split on non-word characters and filter short tokens
    const tokens = text
      .split(/\W+/)
      .filter((t) => t.length > 1)
      .filter(Boolean);

    // Generate n-grams for partial matching (2-3 character sequences)
    const ngrams: string[] = [];
    for (const token of tokens) {
      if (token.length >= 3) {
        for (let i = 0; i <= token.length - 2; i++) {
          ngrams.push(token.substring(i, i + 2));
        }
        for (let i = 0; i <= token.length - 3; i++) {
          ngrams.push(token.substring(i, i + 3));
        }
      }
    }

    return [...new Set([...tokens, ...ngrams])];
  }

  /**
   * Create indexed content from content item
   */
  private createIndexedContent(
    item: ContentItem,
    tokens: string[]
  ): IndexedContent {
    const baseContent: IndexedContent = {
      id: item.id,
      type: item.type,
      searchableText: [
        item.title,
        item.description,
        ...(item.tags || []),
        item.content,
      ]
        .filter(Boolean)
        .join(' '),
      tokens,
      fields: {
        title: item.title || '',
        description: item.description,
        tags: item.tags || [],
        author: item.author || '',
        department: item.department || '',
        date: item.date || new Date(),
        format: item.format,
        fileId: item.fileId,
      },
      metadata: { ...item },
    };

    // Add type-specific fields
    if (item.type === 'document') {
      return {
        ...baseContent,
        fileSize: item.fileSize || 0,
        fileType: item.format || 'unknown',
        pageCount: item.pageCount,
      } as IndexedDocument;
    } else if (item.type === 'report') {
      return {
        ...baseContent,
        period: item.period || '',
        attachmentCount: item.attachmentCount || 0,
      } as IndexedReport;
    } else if (item.type === 'message') {
      return {
        ...baseContent,
        conversationId: item.conversationId || '',
        participants: item.participants || [],
      } as IndexedMessage;
    }

    return baseContent;
  }

  /**
   * Get the appropriate map for content type
   */
  private getMapForType(
    type: ContentType
  ): Map<string, IndexedContent> {
    switch (type) {
      case 'document':
        return this.index.documents as Map<string, IndexedContent>;
      case 'report':
        return this.index.reports as Map<string, IndexedContent>;
      case 'message':
        return this.index.messages as Map<string, IndexedContent>;
      default:
        throw new Error(`Unknown content type: ${type}`);
    }
  }

  /**
   * Remove item from inverted index
   */
  private removeFromInvertedIndex(id: string): void {
    for (const [token, ids] of this.invertedIndex.entries()) {
      ids.delete(id);
      if (ids.size === 0) {
        this.invertedIndex.delete(token);
      }
    }
  }

  /**
   * Get total number of indexed items
   */
  private getTotalItems(): number {
    return (
      this.index.documents.size +
      this.index.reports.size +
      this.index.messages.size
    );
  }
}

// Singleton instance
export const searchIndexService = new SearchIndexService();
