// Search domain type definitions

export type ContentType = 'document' | 'report' | 'message';

export interface SearchQuery {
  text: string;
  filters: SearchFilters;
  options: SearchOptions;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sortBy?: 'relevance' | 'date' | 'title';
  sortOrder?: 'asc' | 'desc';
}

export interface SearchFilters {
  name?: string;
  fileId?: string;
  formats?: string[];
  departmentIds?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  contentTypes?: ContentType[];
}

export interface SearchSuggestion {
  id: string;
  type: 'content' | 'recent' | 'filter';
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  matchedText?: string;
}

export interface SearchResultItem {
  id: string;
  type: ContentType;
  title: string;
  snippet: string;
  metadata: {
    author?: string;
    department?: string;
    date: string;
    format?: string;
  };
  relevanceScore: number;
  matchedFields: string[];
}

export interface SearchResults {
  documents: SearchResultItem[];
  reports: SearchResultItem[];
  messages: SearchResultItem[];
  totalCounts: {
    documents: number;
    reports: number;
    messages: number;
  };
}

export interface SearchResult {
  item: IndexedContent;
  score: number;
  matches: SearchMatch[];
  snippet: string;
}

export interface SearchMatch {
  field: string;
  value: string;
  indices: [number, number][]; // Match positions for highlighting
}

export interface IndexedContent {
  id: string;
  type: ContentType;
  searchableText: string; // Concatenated searchable fields
  tokens: string[]; // Tokenized for fuzzy matching
  fields: {
    title: string;
    description?: string;
    tags: string[];
    author: string;
    department: string;
    date: Date;
    format?: string;
    fileId?: string;
  };
  metadata: Record<string, any>;
}

export interface IndexedDocument extends IndexedContent {
  fileSize: number;
  fileType: string;
  pageCount?: number;
}

export interface IndexedReport extends IndexedContent {
  period: string;
  attachmentCount: number;
}

export interface IndexedMessage extends IndexedContent {
  conversationId: string;
  participants: string[];
}

export interface SearchIndex {
  documents: Map<string, IndexedDocument>;
  reports: Map<string, IndexedReport>;
  messages: Map<string, IndexedMessage>;
  metadata: {
    lastUpdated: Date;
    totalItems: number;
    version: string;
  };
}

export interface AISummary {
  contentId: string;
  contentTitle: string;
  summary: string;
  bulletPoints: string[];
  generatedAt: Date;
  metadata: {
    wordCount: number;
    readingTime: string;
  };
}

export interface SearchURLState {
  q?: string; // Query text
  name?: string;
  fileId?: string;
  formats?: string; // Comma-separated
  depts?: string; // Comma-separated department IDs
  from?: string; // ISO date string
  to?: string; // ISO date string
  sort?: string;
  page?: string;
}

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  description?: string;
  tags: string[];
  author: string;
  department: string;
  date: Date;
  format?: string;
  fileId?: string;
  content?: string;
  [key: string]: any;
}
