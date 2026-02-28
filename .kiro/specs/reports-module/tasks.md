# Implementation Plan: Reports Module

## Overview

This implementation plan breaks down the Reports Module into incremental coding tasks. The module will be built using React 18 + TypeScript + Vite with shadcn/ui components, Tiptap rich text editor, React Hook Form, and Zod validation. Implementation follows a bottom-up approach: data layer → core components → pages → integration.

## Tasks

- [x] 1. Set up data models and mock API layer
  - [x] 1.1 Create TypeScript interfaces for Report, Period, FileAttachment, AISummary, and input types
    - Define all data models in `src/types/reports.ts`
    - Include CreateReportInput and UpdateReportInput interfaces
    - _Requirements: 4.3, 8.1, 9.1, 15.1, 15.2, 15.3, 15.4_
  
  - [x] 1.2 Implement mock reports API with localStorage persistence
    - Create `src/lib/reports/mockReportsApi.ts` with MockReportsAPI class
    - Implement getReports, getReportById, createReport, updateReport, deleteReport methods
    - Add realistic delays (200-500ms) to simulate network requests
    - Implement file-to-data-URL conversion for attachments
    - Add localStorage persistence logic
    - _Requirements: 4.5, 4.6, 5.6, 6.6, 8.7, 15.1, 15.2, 15.3, 15.4_
  
  - [ ]* 1.3 Write property tests for mock API operations
    - **Property 9: Report Creation Sets Author** - Validates: Requirements 4.5, 15.1, 15.2
    - **Property 10: Report Creation Sets Department** - Validates: Requirements 4.6
    - **Property 17: Author Preservation on Edit** - Validates: Requirements 5.6
    - **Property 22: Delete Removes Report and Attachments** - Validates: Requirements 6.6
    - **Property 34: Edit Updates Timestamp** - Validates: Requirements 15.3
    - **Property 35: Edit Records Editor** - Validates: Requirements 15.4

- [x] 2. Implement permission helpers and AI summarizer
  - [x] 2.1 Create permission helper functions
    - Create `src/lib/reports/reportPermissions.ts`
    - Implement canEditReport, canDeleteReport, canViewReport functions
    - Implement filterReportsByPermission function
    - _Requirements: 2.1, 2.2, 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4_
  
  - [x] 2.2 Implement mock AI summarizer
    - Create `src/lib/reports/aiSummarizer.ts`
    - Implement generateMockSummary function with 2-second delay
    - Add HTML stripping and key phrase extraction logic
    - Format output with 3-5 bullet points and disclaimer
    - _Requirements: 10.4, 10.6, 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_
  
  - [ ]* 2.3 Write property tests for permissions and AI summarizer
    - **Property 12: Edit Permission for Report Authors** - Validates: Requirements 5.1
    - **Property 13: Edit Permission for Department Heads** - Validates: Requirements 5.2
    - **Property 14: Edit Permission for Super Admins** - Validates: Requirements 5.3
    - **Property 15: Edit Permission Denied for Non-Author Staff** - Validates: Requirements 5.4
    - **Property 18: Delete Permission for Report Authors** - Validates: Requirements 6.1
    - **Property 19: Delete Permission for Department Heads** - Validates: Requirements 6.2
    - **Property 20: Delete Permission for Super Admins** - Validates: Requirements 6.3
    - **Property 21: Delete Permission Denied for Non-Author Staff** - Validates: Requirements 6.4
    - **Property 31: AI Summary Contains Content** - Validates: Requirements 10.6, 11.2
    - **Property 32: AI Summary Format** - Validates: Requirements 11.1, 11.3, 11.4
    - **Property 33: AI Summary Consistency** - Validates: Requirements 11.5

- [x] 3. Create Reports Context and hooks
  - [x] 3.1 Implement ReportsContext provider
    - Create `src/context/ReportsContext.tsx`
    - Define ReportsContextState and ReportsContextMethods interfaces
    - Implement provider with state management and CRUD operations
    - Load reports from localStorage on mount
    - _Requirements: 4.5, 4.6, 5.6, 6.6_
  
  - [x] 3.2 Create useReports custom hook
    - Create `src/hooks/useReports.ts`
    - Export convenient access to context state and methods
    - Add helper methods: getReportsByPeriod, getReportsByTag
    - _Requirements: 1.2, 9.7_
  
  - [ ]* 3.3 Write unit tests for context and hooks
    - Test context initialization and CRUD operations
    - Test filtering by period and tags
    - Test error handling and loading states

- [ ] 4. Checkpoint - Ensure data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build core UI components
  - [x] 5.1 Create PeriodFilter component
    - Create `src/components/reports/PeriodFilter.tsx`
    - Implement five tabs: Daily, Weekly, Monthly, Quarterly, Annual
    - Add active state styling with emerald accent
    - Make horizontally scrollable on mobile
    - _Requirements: 1.1, 1.3, 12.4, 13.1_
  
  - [ ]* 5.2 Write property tests for PeriodFilter
    - **Property 1: Period Filter Displays Matching Reports** - Validates: Requirements 1.2
    - **Property 3: Period Filter Persists Across Navigation** - Validates: Requirements 1.4
  
  - [x] 5.3 Create TagInput component
    - Create `src/components/reports/TagInput.tsx`
    - Implement input field with Enter/comma to add tags
    - Display tags as removable chips
    - Add tag normalization (lowercase, hyphenate spaces)
    - Prevent duplicates
    - _Requirements: 9.1, 9.2, 9.3, 9.4_
  
  - [ ]* 5.4 Write property tests for TagInput
    - **Property 28: Tag Display as Chips** - Validates: Requirements 9.3
    - **Property 29: Tag Normalization** - Validates: Requirements 9.4
  
  - [x] 5.5 Create FileUpload component
    - Create `src/components/reports/FileUpload.tsx`
    - Implement drag-and-drop zone
    - Add file type validation (PDF, DOCX, XLSX, PNG, JPG, TXT)
    - Add file size validation (10MB limit)
    - Display uploaded files list with remove buttons
    - Show file names and sizes
    - _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_
  
  - [ ]* 5.6 Write property tests for FileUpload
    - **Property 24: File Type Validation** - Validates: Requirements 8.2
    - **Property 25: File Size Validation** - Validates: Requirements 8.3, 8.4
    - **Property 26: Attachment Metadata Display** - Validates: Requirements 8.5

- [ ] 6. Build rich text editor component
  - [ ] 6.1 Set up Tiptap editor with extensions
    - Create `src/components/reports/RichTextEditor.tsx`
    - Configure Tiptap with StarterKit, Bold, Italic, Underline, Strike, Link extensions
    - Add BulletList, OrderedList, Heading extensions
    - Add Placeholder extension
    - _Requirements: 7.1, 7.2, 7.3, 7.4_
  
  - [ ] 6.2 Create formatting toolbar
    - Implement toolbar with formatting buttons
    - Add icons for bold, italic, underline, strikethrough, lists, headings, links
    - Add keyboard shortcuts (Mod-B, Mod-I, Mod-U, Mod-K)
    - Style with shadcn/ui button components
    - _Requirements: 7.6, 7.7, 13.3_
  
  - [ ] 6.3 Style editor with design system
    - Match shadcn/ui input styling
    - Add emerald focus ring
    - Set minimum height to 200px
    - Add prose styling for content display
    - _Requirements: 13.1, 13.3, 13.5, 13.6_
  
  - [ ]* 6.4 Write property tests for rich text editor
    - **Property 23: Rich Text Formatting Round-Trip** - Validates: Requirements 7.5

- [ ] 7. Create report display components
  - [ ] 7.1 Create ReportCard component
    - Create `src/components/reports/ReportCard.tsx`
    - Display title, creation date, author name, department name
    - Show truncated content preview (150 chars max)
    - Display all tags as chips
    - Add edit/delete buttons with permission checks
    - Add click handler to navigate to detail view
    - Style with emerald accent for hover effects
    - _Requirements: 2.5, 3.1, 3.2, 3.4, 3.5, 3.6, 15.5, 15.7_
  
  - [ ]* 7.2 Write property tests for ReportCard
    - **Property 6: Report Cards Display Required Metadata** - Validates: Requirements 3.1, 2.5, 15.5, 15.7
    - **Property 7: Report Cards Display All Tags** - Validates: Requirements 3.4, 9.5
    - **Property 8: Content Preview Truncation** - Validates: Requirements 3.6
  
  - [ ] 7.3 Create EmptyState component
    - Create `src/components/reports/EmptyState.tsx`
    - Support different messages for no reports, no department, no filter results
    - Include "Create Report" button where appropriate
    - Add icon or illustration
    - _Requirements: 2.4, 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_
  
  - [ ] 7.4 Create ShimmerLoader component
    - Create `src/components/reports/ShimmerLoader.tsx`
    - Implement gradient shimmer animation with emerald accent
    - Make reusable for AI summary loading state
    - _Requirements: 10.2, 10.3, 10.4_

- [ ] 8. Build AI summary panel
  - [ ] 8.1 Create AISummaryPanel component
    - Create `src/components/reports/AISummaryPanel.tsx`
    - Implement slide-in animation from right using Framer Motion
    - Display shimmer loader during generation
    - Show summary with bullet points and disclaimer
    - Add close button and backdrop overlay
    - Make full-width on mobile
    - _Requirements: 10.5, 10.6, 10.7, 10.8, 11.3, 11.4, 12.6_
  
  - [ ]* 8.2 Write unit tests for AISummaryPanel
    - Test panel open/close animations
    - Test summary display after loading
    - Test mobile responsive behavior

- [ ] 9. Checkpoint - Ensure component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Create report form page
  - [x] 10.1 Set up ReportFormPage with React Hook Form and Zod
    - Create `src/pages/Reports/ReportFormPage.tsx`
    - Set up form schema with Zod validation
    - Integrate React Hook Form
    - Add title input field with required validation
    - Add period dropdown
    - _Requirements: 4.2, 4.3, 4.7_
  
  - [x] 10.2 Integrate RichTextEditor, TagInput, and FileUpload into form
    - Add RichTextEditor for content field
    - Add TagInput for tags field
    - Add FileUpload for attachments field
    - Wire up form state management
    - _Requirements: 4.3, 4.4, 7.1, 8.1, 9.1_
  
  - [x] 10.3 Implement form submission for create mode
    - Handle form submit with createReport API call
    - Show loading state during submission
    - Display success message on completion
    - Navigate to new report detail page
    - Handle validation errors
    - _Requirements: 4.5, 4.6, 4.8_
  
  - [x] 10.4 Implement form pre-population for edit mode
    - Detect edit mode from route params
    - Load existing report data
    - Pre-populate all form fields
    - _Requirements: 5.5_
  
  - [x] 10.5 Implement form submission for edit mode
    - Handle form submit with updateReport API call
    - Preserve original author
    - Update lastEditedBy and updatedAt
    - Display success message and return to detail view
    - _Requirements: 5.6, 5.7, 15.3, 15.4_
  
  - [ ]* 10.6 Write property tests for form operations
    - **Property 11: Title Validation Rejects Empty Input** - Validates: Requirements 4.7
    - **Property 16: Edit Form Pre-Population** - Validates: Requirements 5.5

- [ ] 11. Create report detail page
  - [x] 11.1 Implement ReportDetailPage layout
    - Create `src/pages/Reports/ReportDetailPage.tsx`
    - Load report by ID from route params
    - Display full report content with preserved formatting
    - Show metadata: title, author, dates, department, subdepartment
    - Display all tags
    - _Requirements: 3.3, 15.6, 15.7_
  
  - [x] 11.2 Add file attachments display
    - Display all attachments as downloadable links
    - Show file names and sizes
    - _Requirements: 8.7_
  
  - [x] 11.3 Add edit and delete buttons with permission checks
    - Use permission helpers to show/hide buttons
    - Wire up edit button to navigate to edit form
    - Implement delete button with confirmation dialog
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 6.1, 6.2, 6.3, 6.4, 6.5, 6.7_
  
  - [x] 11.4 Integrate AI Summarize button and panel
    - Add "AI Summarize" button
    - Handle button click to trigger summary generation
    - Show AISummaryPanel with shimmer loader
    - Display generated summary after 2-second delay
    - _Requirements: 10.1, 10.2, 10.4, 10.5, 10.6_
  
  - [ ]* 11.5 Write property tests for detail page
    - **Property 27: Report Attachments Display as Links** - Validates: Requirements 8.7
    - **Property 36: Report Detail Displays Timestamps** - Validates: Requirements 15.6

- [ ] 12. Create reports list page
  - [x] 12.1 Implement ReportsPage layout
    - Create `src/pages/Reports/ReportsPage.tsx`
    - Add PeriodFilter component at top
    - Implement responsive grid layout (3/2/1 columns)
    - Add "Create Report" button
    - _Requirements: 1.1, 4.1, 12.1, 12.2, 12.3_
  
  - [x] 12.2 Implement period filtering logic
    - Connect PeriodFilter to state
    - Filter reports by selected period using useReports hook
    - Default to "monthly" on page load
    - Maintain filter selection across navigation
    - _Requirements: 1.2, 1.3, 1.4_
  
  - [x] 12.3 Implement department-based access control
    - Filter reports by user's department context
    - Show all reports for Super Admin users
    - Show department reports for Staff and Dept Head users
    - Display empty state when no department assigned
    - _Requirements: 2.1, 2.2, 2.3, 2.4_
  
  - [x] 12.4 Implement sorting and tag filtering
    - Sort reports in reverse chronological order
    - Add tag click handler to filter by tag
    - Display filtered results
    - Show appropriate empty states
    - _Requirements: 1.5, 9.6, 9.7, 14.5_
  
  - [x] 12.5 Render ReportCard components in grid
    - Map filtered reports to ReportCard components
    - Pass edit/delete handlers
    - Handle card click navigation
    - _Requirements: 3.1, 3.2, 3.3_
  
  - [ ]* 12.6 Write property tests for reports list
    - **Property 1: Period Filter Displays Matching Reports** - Validates: Requirements 1.2
    - **Property 2: Period Filter Maintains Chronological Order** - Validates: Requirements 1.5
    - **Property 4: Department-Based Access Control for Non-Admins** - Validates: Requirements 2.1, 4.6
    - **Property 5: Super Admin Sees All Reports** - Validates: Requirements 2.2
    - **Property 30: Tag Filter Shows Matching Reports** - Validates: Requirements 9.7

- [ ] 13. Checkpoint - Ensure page integration tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 14. Set up routing and navigation
  - [x] 14.1 Add reports routes to router configuration
    - Add routes: /reports, /reports/new, /reports/:id, /reports/:id/edit
    - Configure route components
    - Add route guards if needed
    - _Requirements: 3.3, 4.2, 5.5_
  
  - [ ] 14.2 Update navigation menu
    - Add "Reports" link to sidebar navigation
    - Use appropriate icon
    - Highlight active route
    - _Requirements: 13.1, 13.2, 13.3_

- [ ] 15. Implement responsive design and design system consistency
  - [ ] 15.1 Apply responsive breakpoints to all components
    - Verify grid layouts adapt correctly (3/2/1 columns)
    - Ensure Period Filter scrolls horizontally on mobile
    - Stack form fields vertically on mobile
    - Make Summary Panel full-width on mobile
    - Test all components at mobile, tablet, desktop sizes
    - _Requirements: 12.1, 12.2, 12.3, 12.4, 12.5, 12.6, 12.7_
  
  - [ ] 15.2 Verify design system consistency
    - Confirm emerald accent color (#10b981) usage
    - Confirm navy color (#0f172a) usage
    - Verify all components use shadcn/ui primitives
    - Check typography scale and font families
    - Verify border radius, shadows, and spacing tokens
    - Test hover and focus states
    - Confirm loading spinner matches existing components
    - _Requirements: 13.1, 13.2, 13.3, 13.4, 13.5, 13.6, 13.7_

- [ ] 16. Add error handling and validation
  - [ ] 16.1 Implement form validation error messages
    - Add inline error for empty title
    - Add error for invalid file types
    - Add error for files exceeding 10MB
    - Add error for storage quota exceeded
    - _Requirements: 4.7, 8.3, 8.4_
  
  - [ ] 16.2 Implement API error handling
    - Add toast notifications for network failures
    - Handle "report not found" errors with redirect
    - Handle permission denied errors
    - Add loading states for all async operations
    - _Requirements: 4.8, 5.7, 6.7_
  
  - [ ] 16.3 Handle edge cases
    - Display empty state when no department assigned
    - Handle short content for AI summarization
    - Handle missing or deleted reports
    - _Requirements: 2.4, 11.6, 14.4_

- [ ] 17. Wrap ReportsContext provider in app
  - [x] 17.1 Add ReportsContext provider to app root
    - Wrap app with ReportsProvider in main App component
    - Ensure provider is inside AuthProvider
    - Initialize reports from localStorage on mount
    - _Requirements: 2.1, 2.2, 4.5, 4.6_

- [ ] 18. Final integration and testing
  - [ ] 18.1 Test complete user flows end-to-end
    - Test create report flow
    - Test edit report flow
    - Test delete report flow
    - Test period filtering
    - Test tag filtering
    - Test AI summarization
    - Test file attachments
    - Test permission-based access
    - _Requirements: All requirements_
  
  - [ ]* 18.2 Write integration tests for critical flows
    - Test full CRUD operations
    - Test permission enforcement
    - Test filtering and sorting
    - Test responsive behavior

- [ ] 19. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP delivery
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Checkpoints ensure incremental validation at key milestones
- Implementation assumes existing authentication system and design system are in place
- Mock API layer is designed for easy replacement with real backend integration
