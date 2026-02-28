import type { SearchQuery, SearchFilters, SearchOptions } from '@/types/search';

export class SearchURLManager {
  /**
   * Serialize search query to URL parameters
   */
  serialize(query: SearchQuery): string {
    const params = new URLSearchParams();

    // Add query text
    if (query.text) {
      params.set('q', query.text);
    }

    // Add filters
    if (query.filters.name) {
      params.set('name', query.filters.name);
    }

    if (query.filters.fileId) {
      params.set('fileId', query.filters.fileId);
    }

    if (query.filters.formats && query.filters.formats.length > 0) {
      params.set('formats', query.filters.formats.join(','));
    }

    if (query.filters.departmentIds && query.filters.departmentIds.length > 0) {
      params.set('depts', query.filters.departmentIds.join(','));
    }

    if (query.filters.dateRange) {
      params.set(
        'from',
        query.filters.dateRange.start.toISOString().split('T')[0]
      );
      params.set(
        'to',
        query.filters.dateRange.end.toISOString().split('T')[0]
      );
    }

    if (query.filters.contentTypes && query.filters.contentTypes.length > 0) {
      params.set('types', query.filters.contentTypes.join(','));
    }

    // Add options
    if (query.options.sortBy) {
      params.set('sort', query.options.sortBy);
    }

    if (query.options.sortOrder) {
      params.set('order', query.options.sortOrder);
    }

    if (query.options.offset) {
      params.set('page', String(Math.floor(query.options.offset / (query.options.limit || 20)) + 1));
    }

    return params.toString();
  }

  /**
   * Parse URL parameters to search query
   */
  parse(urlParams: URLSearchParams): SearchQuery {
    const filters: SearchFilters = {};
    const options: SearchOptions = {};

    // Parse filters
    const name = urlParams.get('name');
    if (name) filters.name = name;

    const fileId = urlParams.get('fileId');
    if (fileId) filters.fileId = fileId;

    const formats = urlParams.get('formats');
    if (formats) {
      filters.formats = formats.split(',').filter(Boolean);
    }

    const depts = urlParams.get('depts');
    if (depts) {
      filters.departmentIds = depts.split(',').filter(Boolean);
    }

    const types = urlParams.get('types');
    if (types) {
      filters.contentTypes = types.split(',').filter(Boolean) as any[];
    }

    // Parse date range
    const from = urlParams.get('from');
    const to = urlParams.get('to');
    if (from && to) {
      try {
        filters.dateRange = {
          start: new Date(from),
          end: new Date(to),
        };
      } catch (error) {
        console.error('Invalid date range in URL:', error);
      }
    }

    // Parse options
    const sort = urlParams.get('sort');
    if (sort && ['relevance', 'date', 'title'].includes(sort)) {
      options.sortBy = sort as 'relevance' | 'date' | 'title';
    }

    const order = urlParams.get('order');
    if (order && ['asc', 'desc'].includes(order)) {
      options.sortOrder = order as 'asc' | 'desc';
    }

    const page = urlParams.get('page');
    if (page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum) && pageNum > 0) {
        options.offset = (pageNum - 1) * 20;
        options.limit = 20;
      }
    }

    return {
      text: urlParams.get('q') || '',
      filters,
      options,
    };
  }

  /**
   * Update URL with search state
   */
  updateURL(query: SearchQuery, navigate: (url: string) => void): void {
    const serialized = this.serialize(query);
    const url = serialized ? `/search?${serialized}` : '/search';
    navigate(url);
  }
}

// Singleton instance
export const searchURLManager = new SearchURLManager();
