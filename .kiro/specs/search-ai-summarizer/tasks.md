# Implementation Plan: Search & AI Summarizer

## Overview

This implementation plan breaks down the Search & AI Summarizer feature into discrete, actionable tasks. The feature provides global search capabilities with autosuggestions, advanced filtering, organized results display, and AI-powered content summarization. Implementation follows a bottom-up approach: core services first, then state management, then UI components, and finally integration.

## Tasks

- [x] 1. Set up search infrastructure and core services
  - [x] 1.1 Create TypeScript type definitions for search domain
    - Create `src/types/search.ts` with interfaces for SearchQuery, SearchFilters, SearchResults, SearchIndex, IndexedContent, SearchSuggestion, AISummary
    - Define ContentType union type and SearchOptions interface
    - _Requirements: 5.1, 5.2, 10.1_

  - [x] 1.2 Implement SearchIndexService for content indexing
    - Create `src/lib/search/searchIndexService.ts` with SearchIndexService class
    - Implement buildIndex method with tokenization and inverted index creation
    - Implement findByPrefix method for autosuggestion support
    - Implement incremental index update methods
    - _Requirements: 5.1, 5.2, 9.1_

  - [ ]* 1.3 Write property test for SearchIndexService
    - **Property 12: Cross-Content Search Scope**
    - **Validates: Requirements 5.2, 5.3**

  - [x] 1.4 Implement SearchCacheService with LRU caching
    - Create `src/lib/search/searchCacheService.ts` with SearchCacheService class
    - Implement get/set methods with 5-minute TTL
    - Implement LRU eviction when cache exceeds 100 entries
    - Implement cache key generation from query + filters
    - _Requirements: 9.2, 9.3_

  - [ ]* 1.5 Write property test for cache TTL and LRU behavior
    - **Property 19: Search Result Caching**
    - **Validates: Requirements 9.2, 9.3**

  - [x] 1.6 Implement SearchService with relevance scoring
    - Create `src/lib/search/searchService.ts` with SearchService class
    - Implement search method with TF-IDF inspired scoring algorithm
    - Implement filter application logic (intersection of all filters)
    - Integrate with SearchIndexService and SearchCacheService
    - Implement result ranking by relevance score
    - _Requirements: 3.2, 3.3, 5.4, 5.5_

  - [ ]* 1.7 Write property tests for SearchService
    - **Property 5: Multiple Filter Application**
    - **Property 13: Results Ranked by Relevance**
    - **Validates: Requirements 3.3, 5.4**

- [x] 2. Implement autosuggestion system
  - [x] 2.1 Create AutosuggestionService
    - Create `src/lib/search/autosuggestionService.ts` with AutosuggestionService class
    - Implement generateSuggestions method with prefix matching
    - Implement recent search tracking (last 10 searches)
    - Limit suggestions to maximum 10 items
    - _Requirements: 1.3, 2.1, 2.2_

  - [ ]* 2.2 Write property tests for autosuggestion constraints
    - **Property 1: Autosuggestion Count Limit**
    - **Property 2: Autosuggestion Minimum Length**
    - **Property 3: Autosuggestion Content Types**
    - **Validates: Requirements 1.3, 2.1, 2.2_

- [x] 3. Implement URL state management
  - [x] 3.1 Create SearchURLManager for serialization/parsing
    - Create `src/lib/search/searchURLManager.ts` with SearchURLManager class
    - Implement serialize method to convert SearchQuery to URL parameters
    - Implement parse method to convert URL parameters to SearchQuery
    - Handle date serialization (ISO format, date-only)
    - Handle array serialization (comma-separated)
    - _Requirements: 10.1, 10.2, 10.3_

  - [ ]* 3.2 Write property test for URL round-trip
    - **Property 20: URL Parameter Parsing**
    - **Property 21: Search State Serialization**
    - **Property 23: Search State Round-Trip**
    - **Validates: Requirements 10.1, 10.2, 10.4, 10.5**

- [x] 4. Implement Mock AI Service
  - [x] 4.1 Create MockAIService for content summarization
    - Create `src/lib/search/mockAIService.ts` with MockAIService class
    - Implement generateSummary method with 2-second delay simulation
    - Implement template-based summary generation for documents, reports, messages
    - Implement summary caching by content ID
    - Extract key sentences and generate bullet points
    - Calculate word count and reading time metadata
    - _Requirements: 7.1, 7.2, 7.3, 7.4_

  - [ ]* 4.2 Write unit tests for MockAIService
    - Test 2-second delay timing
    - Test summary caching behavior
    - Test different content type templates
    - _Requirements: 7.2_

- [x] 5. Create custom React hooks
  - [x] 5.1 Implement useDebouncedValue hook
    - Create `src/hooks/useDebouncedValue.ts` with generic debounce hook
    - Support configurable delay parameter
    - Clean up timers on unmount
    - _Requirements: 9.1_

  - [x] 5.2 Implement useSearch hook
    - Create `src/hooks/useSearch.ts` with search state management
    - Integrate with SearchService for query execution
    - Integrate with SearchURLManager for URL synchronization
    - Provide query, filters, results, loading state
    - Provide executeSearch, updateFilters, clearFilters methods
    - _Requirements: 1.5, 3.2, 3.4, 9.1_

  - [x] 5.3 Implement useAISummary hook
    - Create `src/hooks/useAISummary.ts` with AI summary state management
    - Integrate with MockAIService
    - Provide loading, summary, error states
    - Provide generateSummary method
    - Track previously summarized content
    - _Requirements: 6.5, 7.1, 7.2_

- [ ] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Create SearchContext for global state
  - [x] 7.1 Implement SearchContext and provider
    - Create `src/context/SearchContext.tsx` with SearchContext
    - Provide search query, filters, results, loading state
    - Provide methods: executeSearch, updateQuery, updateFilters, clearFilters
    - Initialize SearchIndexService with existing content
    - Subscribe to content updates for incremental indexing
    - _Requirements: 1.1, 3.1, 5.1_

  - [x] 7.2 Integrate SearchContext into App component
    - Wrap application with SearchProvider
    - Ensure SearchContext is available to all components
    - _Requirements: 1.1_

- [x] 8. Implement SearchBar component
  - [x] 8.1 Create SearchBar with input and debouncing
    - Create `src/components/search/SearchBar.tsx` component
    - Use shadcn/ui Input component
    - Implement 150ms debounced input handling
    - Connect to SearchContext for query state
    - Handle Enter key to execute search
    - Handle Escape key to clear input
    - _Requirements: 1.1, 1.2, 1.5, 9.1_

  - [ ]* 8.2 Write unit tests for SearchBar interactions
    - Test debounced input updates
    - Test Enter key execution
    - Test Escape key clearing
    - _Requirements: 1.5, 9.1_

- [ ] 9. Implement AutosuggestionDropdown component
  - [x] 9.1 Create AutosuggestionDropdown with suggestion display
    - Create `src/components/search/AutosuggestionDropdown.tsx` component
    - Use shadcn/ui Popover or custom positioned dropdown
    - Display suggestions grouped by type (Recent, Documents, Reports, Messages)
    - Highlight matching text portions in suggestions
    - Implement keyboard navigation (Arrow keys, Enter, Escape)
    - Implement click-outside detection to close dropdown
    - Show dropdown only when query has 2+ characters
    - Limit display to 10 suggestions
    - _Requirements: 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 2.5_

  - [ ]* 9.2 Write property test for suggestion highlighting
    - **Property 4: Autosuggestion Highlighting**
    - **Validates: Requirements 2.3**

  - [ ]* 9.3 Write unit tests for AutosuggestionDropdown
    - Test keyboard navigation
    - Test click-outside closing
    - Test minimum character requirement
    - _Requirements: 2.1, 2.4, 2.5_

- [x] 10. Integrate SearchBar with AutosuggestionDropdown
  - [x] 10.1 Wire SearchBar to show/hide AutosuggestionDropdown
    - Update SearchBar to manage suggestion dropdown visibility
    - Pass query and suggestions to AutosuggestionDropdown
    - Handle suggestion selection to execute search or navigate
    - _Requirements: 1.2, 1.3, 1.4_

- [x] 11. Implement SearchFilters component
  - [x] 11.1 Create SearchFilters with all filter types
    - Create `src/components/search/SearchFilters.tsx` component
    - Implement NameFilter (text input)
    - Implement FileIDFilter (text input)
    - Implement FormatFilter (multi-select checkboxes for PDF, DOCX, XLSX, etc.)
    - Implement DepartmentFilter (multi-select dropdown with department hierarchy)
    - Implement DateRangeFilter (date picker with presets: Today, Last 7 days, Last 30 days, Custom)
    - Display active filter count badge
    - Provide "Clear All Filters" button
    - Make collapsible (sidebar on desktop, drawer on mobile)
    - _Requirements: 3.1, 3.2, 3.4, 3.5, 3.6_

  - [ ]* 11.2 Write property test for active filter count
    - **Property 7: Active Filter Count Accuracy**
    - **Validates: Requirements 3.5**

  - [ ]* 11.3 Write unit tests for SearchFilters
    - Test filter application updates results within 300ms
    - Test filter removal updates results
    - Test clear all filters action
    - Test active filter count display
    - _Requirements: 3.2, 3.4, 3.5, 3.6_

- [x] 12. Implement SearchResultsPanel component
  - [x] 12.1 Create SearchResultCard component
    - Create `src/components/search/SearchResultCard.tsx` component
    - Display content type icon, title, snippet (150 chars), metadata badges
    - Highlight search query terms in title and snippet
    - Include "Open" and "AI Summary" action buttons
    - _Requirements: 4.6, 6.1, 6.3_

  - [x] 12.2 Create SearchResultsPanel with grouped results
    - Create `src/components/search/SearchResultsPanel.tsx` component
    - Group results into Documents, Reports, Messages categories
    - Display total count for each category
    - Show initial 20 results per category
    - Provide "Load More" button when category has >20 results
    - Display loading skeletons during search
    - Display empty state with helpful search tips when no results
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

  - [ ]* 12.3 Write property tests for SearchResultsPanel
    - **Property 8: Results Grouped by Type with Counts**
    - **Property 9: Initial Results Pagination**
    - **Property 10: Load More Availability**
    - **Property 11: Query Term Highlighting in Results**
    - **Validates: Requirements 4.1, 4.2, 4.4, 4.5, 4.6**

  - [ ]* 12.4 Write unit tests for SearchResultsPanel
    - Test empty state display
    - Test loading state display
    - Test load more functionality
    - _Requirements: 4.3, 4.4, 4.5_

- [ ] 13. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 14. Implement AISummaryModal component
  - [x] 14.1 Create AISummaryButton component
    - Create `src/components/search/AISummaryButton.tsx` component
    - Display recognizable AI icon
    - Show different visual state when summary already exists
    - Handle click to open summary modal
    - _Requirements: 6.1, 6.4, 6.5_

  - [ ]* 14.2 Write property test for cached summary indication
    - **Property 14: Cached Summary Indication**
    - **Validates: Requirements 6.5**

  - [x] 14.3 Create AISummaryModal with loading and success states
    - Create `src/components/search/AISummaryModal.tsx` component
    - Use shadcn/ui Dialog component for modal overlay
    - Display loading state with spinner and "Generating summary..." message
    - Display success state with formatted summary text and bullet points
    - Display error state with error message and retry button
    - Show content title and metadata in modal header
    - Provide close button, Escape key, and backdrop click to dismiss
    - Provide "Copy to Clipboard" action for summary text
    - Prevent background scrolling when modal is open
    - Make responsive (full-screen on mobile, centered on desktop)
    - _Requirements: 6.2, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 8.1, 8.2, 8.3, 8.4, 8.5_

  - [ ]* 14.4 Write property tests for AISummaryModal
    - **Property 15: Summary Display Formatting**
    - **Property 16: Summary Modal Content Display**
    - **Property 17: Modal No Navigation**
    - **Property 18: Modal Prevents Background Scroll**
    - **Validates: Requirements 7.3, 7.4, 8.1, 8.5**

  - [ ]* 14.5 Write unit tests for AISummaryModal
    - Test modal dismissal (Escape, backdrop click, close button)
    - Test copy to clipboard action
    - Test loading state display
    - Test error state with retry
    - _Requirements: 7.5, 7.6, 8.2_

- [x] 15. Create SearchPage for dedicated search interface
  - [x] 15.1 Implement SearchPage with filters and results
    - Create `src/pages/SearchPage.tsx` component
    - Layout: SearchFilters sidebar (desktop) or drawer (mobile) + SearchResultsPanel
    - Integrate with React Router useSearchParams for URL state
    - Update URL when search query or filters change
    - Parse URL on mount to restore search state
    - Display search query and active filters at top
    - _Requirements: 3.2, 3.3, 10.3, 10.5_

  - [ ]* 15.2 Write property test for URL state synchronization
    - **Property 22: URL Update on Search**
    - **Validates: Requirements 10.3**

  - [ ]* 15.3 Write integration test for complete search flow
    - Test: User types query → sees suggestions → selects suggestion → views results
    - Test: User applies filters → results update → URL updates
    - Test: User shares URL → another user opens → same results displayed
    - _Requirements: 1.2, 1.3, 1.4, 3.2, 10.5_

- [x] 16. Integrate SearchBar into AppHeader
  - [x] 16.1 Add SearchBar to application header
    - Update AppHeader component to include SearchBar
    - Position between page title and user actions
    - Ensure proper z-index for autosuggestion dropdown
    - Make responsive: full-width on mobile, fixed-width on desktop
    - Ensure SearchBar is visible on all pages
    - _Requirements: 1.1_

- [ ] 17. Add AI Summary buttons to existing pages
  - [ ] 17.1 Add AISummaryButton to report detail pages
    - Update report detail page to include AISummaryButton
    - Pass report content to AI service for summarization
    - _Requirements: 6.3_

  - [ ] 17.2 Add AISummaryButton to document list views
    - Update document list views to include AISummaryButton on each item
    - _Requirements: 6.3_

- [x] 18. Add search route to application routing
  - [x] 18.1 Register /search route in React Router
    - Add SearchPage route to main router configuration
    - Ensure route is accessible from all pages
    - _Requirements: 10.3_

- [ ] 19. Implement error handling and edge cases
  - [ ] 19.1 Add error handling for search failures
    - Handle search timeout (>5 seconds) with timeout message
    - Handle index unavailable with error message and retry action
    - Handle empty query gracefully (clear results, hide suggestions)
    - Handle invalid filter values (date range validation, malformed inputs)
    - _Requirements: 9.4, 9.5_

  - [ ] 19.2 Add error handling for AI summary failures
    - Handle content not found error
    - Handle summary generation failure with retry button
    - Display error toast notifications for non-critical errors
    - _Requirements: 7.1, 7.2_

  - [ ] 19.3 Add error handling for URL parsing
    - Handle malformed URL parameters gracefully
    - Default to empty search for invalid parameters
    - Filter out invalid array entries
    - _Requirements: 10.1_

- [ ] 20. Implement accessibility features
  - [ ] 20.1 Add keyboard navigation support
    - Ensure all interactive elements are keyboard accessible
    - Implement focus trap in modal
    - Return focus to trigger element on modal close
    - Add visible focus indicators
    - _Requirements: 8.2_

  - [ ] 20.2 Add ARIA labels and screen reader support
    - Add ARIA labels to all interactive elements
    - Add ARIA live regions for search result updates
    - Add ARIA expanded/collapsed states for filters
    - Use semantic HTML (nav, main, article, section)
    - _Requirements: 1.1, 2.1, 3.1, 4.1, 8.1_

- [ ] 21. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 22. Performance validation and optimization
  - [ ] 22.1 Validate performance requirements
    - Test autosuggestion response time <200ms
    - Test search execution time <500ms for 10,000 items
    - Test cached search response time <50ms
    - Test filter application time <300ms
    - Test AI summary generation time ≈2 seconds
    - _Requirements: 1.2, 3.2, 5.5, 7.2, 9.1, 9.2, 9.3, 9.4_

  - [ ]* 22.2 Run property-based tests for all correctness properties
    - Execute all 23 property tests with 100+ iterations each
    - Verify no counterexamples found
    - Document any edge cases discovered
    - _Requirements: All requirements_

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Implementation follows bottom-up approach: services → hooks → components → integration
- All code uses TypeScript with React 18 and Vite
- UI components use shadcn/ui (Radix UI primitives)
- Search is client-side with in-memory indexing (suitable for datasets up to 10,000 items)
