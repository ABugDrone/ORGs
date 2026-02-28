# Design Document: Reports Module

## Overview

The Reports Module is a comprehensive feature for the Casi360 internal dashboard that enables users to create, view, manage, and summarize departmental reports. The module integrates seamlessly with the existing authentication system, design system, and routing infrastructure.

### Key Features

- Period-based filtering (Daily, Weekly, Monthly, Quarterly, Annual)
- Department-scoped access control with role-based permissions
- Rich text editing with formatting toolbar
- File attachment support (up to 10MB per file)
- Tag-based categorization and filtering
- Mock AI summarization with shimmer loading animation
- Responsive grid layout adapting to screen sizes
- Full CRUD operations with permission checks

### Technical Stack

- **Frontend Framework**: React 18.3.1 with TypeScript
- **UI Components**: shadcn/ui (Radix UI primitives)
- **Styling**: Tailwind CSS with custom theme tokens
- **Routing**: React Router v6
- **Animations**: Framer Motion
- **Rich Text Editor**: Tiptap (headless editor built on ProseMirror)
- **Form Management**: React Hook Form with Zod validation
- **State Management**: React Context + local component state
- **Data Layer**: Mock data in-memory store with localStorage persistence

### Design Principles

1. **Consistency**: Match existing Casi360 design system (emerald accents, navy backgrounds)
2. **Accessibility**: WCAG-compliant components from shadcn/ui
3. **Performance**: Lazy loading, optimistic updates, efficient re-renders
4. **Maintainability**: Clear separation of concerns, reusable components
5. **Extensibility**: Designed for future real API integration

## Architecture

### High-Level Component Structure

```
src/
├── pages/
│   └── Reports/
│       ├── ReportsPage.tsx          # Main reports list view
│       ├── ReportDetailPage.tsx     # Single report view
│       └── ReportFormPage.tsx       # Create/edit form
├── components/
│   └── reports/
│       ├── ReportCard.tsx           # Report preview card
│       ├── ReportForm.tsx           # Form component
│       ├── RichTextEditor.tsx       # Tiptap editor wrapper
│       ├── FileUpload.tsx           # File attachment handler
│       ├── TagInput.tsx             # Tag creation input
│       ├── PeriodFilter.tsx         # Period tab filter
│       ├── AISummaryPanel.tsx       # Sliding summary panel
│       ├── ShimmerLoader.tsx        # Loading animation
│       └── EmptyState.tsx           # Empty state messages
├── context/
│   └── ReportsContext.tsx           # Reports data provider
├── hooks/
│   └── useReports.ts                # Reports data hooks
├── lib/
│   └── reports/
│       ├── mockReportsApi.ts        # Mock API layer
│       ├── aiSummarizer.ts          # Mock AI logic
│       └── reportPermissions.ts     # Permission helpers
└── data/
    └── mockData.ts                  # Extended with report types
```

### Data Flow

1. **Read Operations**: Component → useReports hook → ReportsContext → mockReportsApi → localStorage
2. **Write Operations**: Component → useReports hook → mockReportsApi → localStorage → Context update → Re-render
3. **Permission Checks**: Component → useAuth hook + reportPermissions helper → Conditional rendering
4. **AI Summarization**: Component → aiSummarizer → Simulated delay → Summary panel display

### Routing Structure

```
/reports                    # Main reports list (ReportsPage)
/reports/new                # Create new report (ReportFormPage)
/reports/:id                # View single report (ReportDetailPage)
/reports/:id/edit           # Edit report (ReportFormPage)
```

## Components and Interfaces

### Core Components

#### ReportsPage

**Responsibility**: Main container for reports list with filtering and navigation

**Props**: None (uses context and hooks)

**State**:
- `selectedPeriod`: Current period filter (default: "monthly")
- `selectedTag`: Active tag filter (optional)

**Key Features**:
- Period filter tabs
- Responsive grid layout (3/2/1 columns)
- Empty states
- Create report button

#### ReportCard

**Responsibility**: Display report metadata in card format

**Props**:
```typescript
interface ReportCardProps {
  report: Report;
  onEdit?: () => void;
  onDelete?: () => void;
}
```

**Features**:
- Truncated content preview (150 chars)
- Tag chips
- Action buttons (conditional based on permissions)
- Click to navigate to detail view
- Hover effects with emerald accent

#### ReportDetailPage

**Responsibility**: Full report view with AI summarization

**Props**: None (uses route params)

**State**:
- `showSummary`: Boolean for summary panel visibility
- `isGeneratingSummary`: Loading state

**Features**:
- Full content display with preserved formatting
- File attachment downloads
- Edit/delete buttons (permission-based)
- AI Summarize button
- Metadata display (author, dates, department)

#### ReportFormPage

**Responsibility**: Create and edit reports

**Props**: None (uses route params for edit mode)

**State**: Managed by React Hook Form

**Features**:
- Title input (required)
- Rich text editor
- Period dropdown
- Tag input
- File upload area
- Form validation
- Submit/cancel actions

#### RichTextEditor

**Responsibility**: Tiptap-based rich text editing

**Props**:
```typescript
interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}
```

**Features**:
- Formatting toolbar (bold, italic, underline, strikethrough)
- Lists (bulleted, numbered)
- Headings (H1, H2, H3)
- Hyperlinks
- Keyboard shortcuts
- Accessible controls

#### FileUpload

**Responsibility**: Handle file attachments

**Props**:
```typescript
interface FileUploadProps {
  files: FileAttachment[];
  onChange: (files: FileAttachment[]) => void;
  maxSize?: number; // Default 10MB
}
```

**Features**:
- Drag-and-drop zone
- File type validation
- Size validation
- Preview list with remove buttons
- Progress indication

#### TagInput

**Responsibility**: Create and manage tags

**Props**:
```typescript
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
}
```

**Features**:
- Input field with Enter/comma to add
- Tag chips with remove button
- Automatic lowercase and hyphenation
- Duplicate prevention

#### AISummaryPanel

**Responsibility**: Display AI-generated summaries

**Props**:
```typescript
interface AISummaryPanelProps {
  report: Report;
  isOpen: boolean;
  onClose: () => void;
}
```

**Features**:
- Slide-in animation from right
- Shimmer loader during generation
- Bullet point summary
- Disclaimer text
- Close button
- Overlay backdrop

#### PeriodFilter

**Responsibility**: Tab-based period filtering

**Props**:
```typescript
interface PeriodFilterProps {
  selected: Period;
  onChange: (period: Period) => void;
}
```

**Features**:
- Five tabs (Daily, Weekly, Monthly, Quarterly, Annual)
- Active state styling
- Horizontal scroll on mobile
- Emerald accent for active tab

### Context and Hooks

#### ReportsContext

**Purpose**: Centralized reports state management

**State**:
```typescript
interface ReportsContextState {
  reports: Report[];
  loading: boolean;
  error: string | null;
}
```

**Methods**:
```typescript
interface ReportsContextMethods {
  createReport: (data: CreateReportInput) => Promise<Report>;
  updateReport: (id: string, data: UpdateReportInput) => Promise<Report>;
  deleteReport: (id: string) => Promise<void>;
  getReport: (id: string) => Report | undefined;
  getReportsByPeriod: (period: Period) => Report[];
  getReportsByTag: (tag: string) => Report[];
  refreshReports: () => Promise<void>;
}
```

#### useReports Hook

**Purpose**: Convenient access to reports context

**Returns**: Combined state and methods from ReportsContext

**Usage**:
```typescript
const { reports, createReport, loading } = useReports();
```

### Permission Helpers

#### reportPermissions.ts

**Functions**:

```typescript
// Check if user can edit a report
canEditReport(user: User, report: Report): boolean

// Check if user can delete a report
canDeleteReport(user: User, report: Report): boolean

// Check if user can view a report
canViewReport(user: User, report: Report): boolean

// Filter reports by user permissions
filterReportsByPermission(reports: Report[], user: User): Report[]
```

**Logic**:
- Super Admin: All permissions
- Dept Head: Full permissions within their department
- Staff: Can edit/delete own reports, view department reports
- Report Author: Can always edit/delete their own reports

## Data Models

### Report

```typescript
interface Report {
  id: string;                    // Unique identifier (UUID)
  title: string;                 // Report title (required, max 200 chars)
  content: string;               // HTML content from rich text editor
  period: Period;                // Time period classification
  departmentId: string;          // Department association
  subdepartmentId?: string;      // Optional subdepartment
  authorId: string;              // User ID of creator
  authorName: string;            // Cached author name for display
  tags: string[];                // Array of tag strings
  attachments: FileAttachment[]; // Associated files
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  lastEditedBy?: string;         // User ID of last editor
}
```

### Period

```typescript
type Period = "daily" | "weekly" | "monthly" | "quarterly" | "annual";
```

### FileAttachment

```typescript
interface FileAttachment {
  id: string;                    // Unique identifier
  name: string;                  // Original filename
  size: number;                  // File size in bytes
  type: string;                  // MIME type
  url: string;                   // Data URL or blob URL for mock
  uploadedAt: string;            // ISO 8601 timestamp
}
```

### Tag

Tags are stored as simple strings within the Report model. No separate Tag entity is needed for the mock implementation.

**Format Rules**:
- Lowercase only
- Spaces replaced with hyphens
- No special characters except hyphens
- Example: "Q1 Results" → "q1-results"

### CreateReportInput

```typescript
interface CreateReportInput {
  title: string;
  content: string;
  period: Period;
  tags: string[];
  attachments: File[]; // Browser File objects
}
```

### UpdateReportInput

```typescript
interface UpdateReportInput {
  title?: string;
  content?: string;
  period?: Period;
  tags?: string[];
  attachments?: FileAttachment[]; // Already processed attachments
  newAttachments?: File[]; // New files to add
}
```

### AISummary

```typescript
interface AISummary {
  reportId: string;
  summary: string;               // HTML with bullet points
  generatedAt: string;           // ISO 8601 timestamp
  bulletPoints: string[];        // Array of summary points
}
```

## State Management

### Context Architecture

The Reports Module uses React Context for global state management, following the existing pattern in the application.

**ReportsContext Structure**:

```typescript
const ReportsContext = createContext<{
  state: ReportsContextState;
  actions: ReportsContextMethods;
} | undefined>(undefined);
```

**Provider Implementation**:
- Initializes reports from localStorage on mount
- Provides CRUD operations
- Handles optimistic updates
- Manages loading and error states
- Persists changes to localStorage

### Local Component State

Individual components manage their own UI state:
- Form inputs (React Hook Form)
- Modal visibility
- Loading indicators
- Temporary UI states (hover, focus)

### Data Persistence

**localStorage Schema**:

```typescript
// Key: "casi360_reports"
{
  reports: Report[];
  lastSync: string; // ISO timestamp
}
```

**Persistence Strategy**:
- Write to localStorage on every mutation
- Read from localStorage on context initialization
- No automatic sync (mock implementation)
- Clear on logout (optional enhancement)

## API/Data Layer Design

### Mock API Implementation

The mock API layer simulates real backend behavior with realistic delays and error handling.

**mockReportsApi.ts**:

```typescript
class MockReportsAPI {
  private reports: Report[] = [];
  private delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  async getReports(): Promise<Report[]> {
    await this.delay(300);
    return [...this.reports];
  }

  async getReportById(id: string): Promise<Report> {
    await this.delay(200);
    const report = this.reports.find(r => r.id === id);
    if (!report) throw new Error("Report not found");
    return report;
  }

  async createReport(input: CreateReportInput, user: User): Promise<Report> {
    await this.delay(500);
    const report: Report = {
      id: generateId(),
      ...input,
      departmentId: user.departmentId,
      subdepartmentId: user.subdepartmentId,
      authorId: user.id,
      authorName: user.name,
      attachments: await this.processAttachments(input.attachments),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.reports.push(report);
    this.persist();
    return report;
  }

  async updateReport(id: string, input: UpdateReportInput, userId: string): Promise<Report> {
    await this.delay(400);
    const index = this.reports.findIndex(r => r.id === id);
    if (index === -1) throw new Error("Report not found");
    
    this.reports[index] = {
      ...this.reports[index],
      ...input,
      updatedAt: new Date().toISOString(),
      lastEditedBy: userId,
    };
    this.persist();
    return this.reports[index];
  }

  async deleteReport(id: string): Promise<void> {
    await this.delay(300);
    this.reports = this.reports.filter(r => r.id !== id);
    this.persist();
  }

  private async processAttachments(files: File[]): Promise<FileAttachment[]> {
    return Promise.all(files.map(async (file) => ({
      id: generateId(),
      name: file.name,
      size: file.size,
      type: file.type,
      url: await this.fileToDataURL(file),
      uploadedAt: new Date().toISOString(),
    })));
  }

  private fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private persist() {
    localStorage.setItem("casi360_reports", JSON.stringify({
      reports: this.reports,
      lastSync: new Date().toISOString(),
    }));
  }

  loadFromStorage() {
    const stored = localStorage.getItem("casi360_reports");
    if (stored) {
      try {
        const data = JSON.parse(stored);
        this.reports = data.reports || [];
      } catch (e) {
        console.error("Failed to load reports from storage", e);
      }
    }
  }
}

export const mockReportsApi = new MockReportsAPI();
```

### AI Summarizer

**aiSummarizer.ts**:

```typescript
export async function generateMockSummary(report: Report): Promise<AISummary> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Handle short content
  if (report.content.length < 100) {
    return {
      reportId: report.id,
      summary: "<p>Report content is too short to summarize</p>",
      bulletPoints: [],
      generatedAt: new Date().toISOString(),
    };
  }

  // Extract text from HTML
  const text = stripHtml(report.content);
  
  // Generate bullet points (mock logic)
  const bulletPoints = extractKeyPhrases(text, 3, 5);
  
  // Format as HTML
  const summary = `
    <div class="space-y-4">
      <h3 class="font-heading font-semibold text-lg">Summary</h3>
      <ul class="list-disc list-inside space-y-2">
        ${bulletPoints.map(point => `<li>${point}</li>`).join('')}
      </ul>
      <p class="text-sm text-muted-foreground italic">
        This is a mock AI-generated summary for demonstration purposes
      </p>
    </div>
  `;

  return {
    reportId: report.id,
    summary,
    bulletPoints,
    generatedAt: new Date().toISOString(),
  };
}

function stripHtml(html: string): string {
  const div = document.createElement('div');
  div.innerHTML = html;
  return div.textContent || div.innerText || '';
}

function extractKeyPhrases(text: string, min: number, max: number): string[] {
  // Mock implementation: split into sentences and take first few
  const sentences = text
    .split(/[.!?]+/)
    .map(s => s.trim())
    .filter(s => s.length > 20);
  
  const count = Math.min(Math.max(min, Math.floor(sentences.length / 3)), max);
  return sentences.slice(0, count);
}
```

## Key Interactions and User Flows

### Flow 1: View Reports by Period

1. User navigates to `/reports`
2. ReportsPage loads with default "Monthly" filter
3. System fetches reports from context
4. System filters reports by period and user permissions
5. System displays reports in grid layout
6. User clicks different period tab
7. System updates filter and re-renders grid

### Flow 2: Create New Report

1. User clicks "Create Report" button
2. System navigates to `/reports/new`
3. ReportFormPage renders empty form
4. User enters title, content, selects period
5. User adds tags and uploads files
6. User clicks "Submit"
7. System validates form data
8. System calls createReport API
9. System shows success message
10. System navigates to new report detail page

### Flow 3: Edit Existing Report

1. User views report detail page
2. System checks edit permissions
3. System shows/hides edit button based on permissions
4. User clicks "Edit" button
5. System navigates to `/reports/:id/edit`
6. ReportFormPage renders with pre-filled data
7. User modifies fields
8. User clicks "Save"
9. System validates and updates report
10. System navigates back to detail page

### Flow 4: Delete Report

1. User views report (detail or card)
2. System checks delete permissions
3. User clicks delete button
4. System shows confirmation dialog
5. User confirms deletion
6. System calls deleteReport API
7. System shows success message
8. System navigates to reports list

### Flow 5: Generate AI Summary

1. User views report detail page
2. User clicks "AI Summarize" button
3. System displays shimmer animation
4. System calls generateMockSummary (2s delay)
5. System slides in summary panel from right
6. User reads summary
7. User clicks close or backdrop
8. System slides out panel

### Flow 6: Filter by Tag

1. User views reports list
2. User clicks a tag on any report card
3. System filters reports to show only those with that tag
4. System displays filtered results
5. User clicks "Clear filter" or selects another tag
6. System updates filter

### Flow 7: Upload File Attachment

1. User is in report form
2. User drags file to upload zone OR clicks to browse
3. System validates file type and size
4. If valid: System adds to attachments list
5. If invalid: System shows error message
6. User can remove attachment before submitting
7. On form submit: System converts files to data URLs
8. System saves report with attachments

## Rich Text Editor Integration

### Tiptap Configuration

**Extensions**:
- StarterKit (basic functionality)
- Bold, Italic, Underline, Strike
- BulletList, OrderedList, ListItem
- Heading (levels 1-3)
- Link
- Placeholder

**Toolbar Buttons**:
```typescript
const toolbarButtons = [
  { command: 'bold', icon: Bold, label: 'Bold', shortcut: 'Mod-B' },
  { command: 'italic', icon: Italic, label: 'Italic', shortcut: 'Mod-I' },
  { command: 'underline', icon: Underline, label: 'Underline', shortcut: 'Mod-U' },
  { command: 'strike', icon: Strikethrough, label: 'Strikethrough' },
  { command: 'bulletList', icon: List, label: 'Bullet List' },
  { command: 'orderedList', icon: ListOrdered, label: 'Numbered List' },
  { command: 'heading', icon: Heading1, label: 'Heading', level: 1 },
  { command: 'link', icon: Link2, label: 'Link', shortcut: 'Mod-K' },
];
```

**Styling**:
- Match shadcn/ui input styling
- Emerald focus ring
- Minimum height: 200px
- Prose styling for content display



## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Period Filter Displays Matching Reports

*For any* set of reports and any selected period filter, the displayed reports should contain only reports whose period matches the selected filter.

**Validates: Requirements 1.2**

### Property 2: Period Filter Maintains Chronological Order

*For any* period filter selection and any set of reports, the displayed reports should be sorted in reverse chronological order (newest first) based on creation timestamp.

**Validates: Requirements 1.5**

### Property 3: Period Filter Persists Across Navigation

*For any* selected period filter, navigating away from the reports page and returning should preserve the same filter selection.

**Validates: Requirements 1.4**

### Property 4: Department-Based Access Control for Non-Admins

*For any* Staff or Dept_Head user, the displayed reports should contain only reports from the user's assigned department.

**Validates: Requirements 2.1, 4.6**

### Property 5: Super Admin Sees All Reports

*For any* Super_Admin user, the displayed reports should include reports from all departments regardless of the admin's assigned department.

**Validates: Requirements 2.2**

### Property 6: Report Cards Display Required Metadata

*For any* report, the rendered report card should contain the report title, creation date, author name, and department name.

**Validates: Requirements 3.1, 2.5, 15.5, 15.7**

### Property 7: Report Cards Display All Tags

*For any* report with tags, the rendered report card should display all associated tags as visual labels.

**Validates: Requirements 3.4, 9.5**

### Property 8: Content Preview Truncation

*For any* report with content exceeding 150 characters, the report card preview should display a truncated version of exactly 150 characters or less.

**Validates: Requirements 3.6**

### Property 9: Report Creation Sets Author

*For any* report creation, the created report should have its authorId set to the current user's ID and authorName set to the current user's name.

**Validates: Requirements 4.5, 15.1, 15.2**

### Property 10: Report Creation Sets Department

*For any* report creation by a user with a department assignment, the created report should be assigned to the user's departmentId and subdepartmentId.

**Validates: Requirements 4.6**

### Property 11: Title Validation Rejects Empty Input

*For any* report form submission where the title is empty or contains only whitespace, the submission should be rejected with a validation error.

**Validates: Requirements 4.7**

### Property 12: Edit Permission for Report Authors

*For any* report and any user, if the user is the report author, the report view should display an edit button.

**Validates: Requirements 5.1**

### Property 13: Edit Permission for Department Heads

*For any* report and any Dept_Head user, if the report belongs to the user's department, the report view should display an edit button.

**Validates: Requirements 5.2**

### Property 14: Edit Permission for Super Admins

*For any* report and any Super_Admin user, the report view should display an edit button.

**Validates: Requirements 5.3**

### Property 15: Edit Permission Denied for Non-Author Staff

*For any* report and any Staff user, if the user is not the report author, the report view should hide the edit button.

**Validates: Requirements 5.4**

### Property 16: Edit Form Pre-Population

*For any* report being edited, the edit form should be pre-populated with the report's current title, content, period, tags, and attachments.

**Validates: Requirements 5.5**

### Property 17: Edit Preserves Original Author

*For any* report edit operation, the updated report should maintain the same authorId and authorName as before the edit.

**Validates: Requirements 5.6**

### Property 18: Delete Permission for Report Authors

*For any* report and any user, if the user is the report author, the report view should display a delete button.

**Validates: Requirements 6.1**

### Property 19: Delete Permission for Department Heads

*For any* report and any Dept_Head user, if the report belongs to the user's department, the report view should display a delete button.

**Validates: Requirements 6.2**

### Property 20: Delete Permission for Super Admins

*For any* report and any Super_Admin user, the report view should display a delete button.

**Validates: Requirements 6.3**

### Property 21: Delete Permission Denied for Non-Author Staff

*For any* report and any Staff user, if the user is not the report author, the report view should hide the delete button.

**Validates: Requirements 6.4**

### Property 22: Delete Removes Report and Attachments

*For any* report with attachments, deleting the report should remove both the report and all associated file attachments from storage.

**Validates: Requirements 6.6**

### Property 23: Rich Text Formatting Round-Trip

*For any* formatted content created in the rich text editor, saving the report and then loading it for editing should preserve all formatting (bold, italic, underline, lists, headings, links).

**Validates: Requirements 7.5**

### Property 24: File Type Validation

*For any* file with a supported MIME type (PDF, DOCX, XLSX, PNG, JPG, TXT), the file upload should accept the file and add it to the attachments list.

**Validates: Requirements 8.2**

### Property 25: File Size Validation

*For any* file exceeding 10MB in size, the file upload should reject the file and display an error message.

**Validates: Requirements 8.3, 8.4**

### Property 26: Attachment Metadata Display

*For any* uploaded file attachment, the form should display the file name and file size in the attachments list.

**Validates: Requirements 8.5**

### Property 27: Report Attachments Display as Links

*For any* report with file attachments, the report detail view should display all attachments as downloadable links with file names.

**Validates: Requirements 8.7**

### Property 28: Tag Display as Chips

*For any* tags added to a report in the form, the form should display each tag as a removable chip.

**Validates: Requirements 9.3**

### Property 29: Tag Normalization

*For any* tag input string, the stored tag should be converted to lowercase with spaces replaced by hyphens.

**Validates: Requirements 9.4**

### Property 30: Tag Filter Shows Matching Reports

*For any* tag selection, the reports list should display only reports that contain the selected tag in their tags array.

**Validates: Requirements 9.7**

### Property 31: AI Summary Contains Content

*For any* report with sufficient content (≥100 characters), the generated AI summary should contain text derived from the report content.

**Validates: Requirements 10.6, 11.2**

### Property 32: AI Summary Format

*For any* generated AI summary, it should contain 3-5 bullet points, a "Summary" heading, and the disclaimer text "This is a mock AI-generated summary for demonstration purposes".

**Validates: Requirements 11.1, 11.3, 11.4**

### Property 33: AI Summary Consistency

*For any* report, generating the AI summary multiple times should produce identical results.

**Validates: Requirements 11.5**

### Property 34: Edit Updates Timestamp

*For any* report edit operation, the updated report should have an updatedAt timestamp that is later than the original updatedAt timestamp.

**Validates: Requirements 15.3**

### Property 35: Edit Records Editor

*For any* report edit operation, the updated report should have its lastEditedBy field set to the ID of the user who performed the edit.

**Validates: Requirements 15.4**

### Property 36: Report Detail Displays Timestamps

*For any* report in the detail view, both the createdAt and updatedAt timestamps should be displayed.

**Validates: Requirements 15.6**

## Error Handling

### Validation Errors

**Form Validation**:
- Empty title: Display inline error "Title is required"
- Content too short (optional warning): "Consider adding more detail"
- Invalid file type: "File type not supported. Please upload PDF, DOCX, XLSX, PNG, JPG, or TXT files"
- File too large: "File size exceeds 10MB limit"
- Duplicate tags: Silently prevent duplicates, no error message

**API Errors**:
- Network failure: Display toast "Unable to save report. Please check your connection"
- Report not found: Display toast "Report not found" and redirect to reports list
- Permission denied: Display toast "You don't have permission to perform this action"
- Storage quota exceeded: Display toast "Storage limit reached. Please remove some attachments"

### Edge Cases

**No Department Assignment**:
- Display empty state: "You must be assigned to a department to view reports"
- Hide "Create Report" button
- Show contact admin message

**Short Content for AI Summary**:
- Display message: "Report content is too short to summarize"
- Disable summarize button for reports <100 characters
- Show tooltip explaining minimum length

**Empty Filter Results**:
- Period filter with no reports: "No reports found for this period"
- Tag filter with no results: "No reports match your filters"
- Include "Clear filters" or "Create Report" button

**Concurrent Edits** (Mock Implementation):
- Last write wins (no conflict detection in mock)
- Future enhancement: Add version tracking

### Error Recovery

**Failed Report Creation**:
- Preserve form data in component state
- Allow user to retry submission
- Don't clear form on error

**Failed File Upload**:
- Remove failed file from list
- Allow user to retry individual file
- Don't block form submission for other files

**Failed Deletion**:
- Keep report in list
- Show error toast
- Allow retry

## Testing Strategy

### Unit Testing Approach

Unit tests will focus on specific examples, edge cases, and integration points:

**Component Tests**:
- ReportCard renders with correct data
- ReportForm validates inputs correctly
- TagInput creates and removes tags
- FileUpload handles drag-and-drop
- PeriodFilter switches tabs
- AISummaryPanel opens and closes

**Hook Tests**:
- useReports provides correct data and methods
- Permission helpers return correct boolean values
- Filter functions return correct subsets

**Utility Tests**:
- Tag normalization converts correctly
- File size validation works for edge cases
- Date formatting displays correctly
- Content truncation handles edge cases

**Edge Case Tests**:
- Empty reports list
- User with no department
- Report with no tags
- Report with no attachments
- Very long titles and content
- Special characters in tags
- Maximum file size boundary

### Property-Based Testing Approach

Property-based tests will verify universal properties across randomized inputs using **fast-check** (JavaScript property-based testing library):

**Configuration**:
- Minimum 100 iterations per property test
- Each test tagged with: `Feature: reports-module, Property {number}: {property_text}`
- Use custom arbitraries for domain models (Report, User, FileAttachment)

**Test Structure**:
```typescript
import fc from 'fast-check';

// Example property test
test('Feature: reports-module, Property 1: Period Filter Displays Matching Reports', () => {
  fc.assert(
    fc.property(
      fc.array(reportArbitrary),
      fc.constantFrom('daily', 'weekly', 'monthly', 'quarterly', 'annual'),
      (reports, period) => {
        const filtered = filterReportsByPeriod(reports, period);
        return filtered.every(report => report.period === period);
      }
    ),
    { numRuns: 100 }
  );
});
```

**Custom Arbitraries**:
```typescript
const reportArbitrary = fc.record({
  id: fc.uuid(),
  title: fc.string({ minLength: 1, maxLength: 200 }),
  content: fc.lorem(),
  period: fc.constantFrom('daily', 'weekly', 'monthly', 'quarterly', 'annual'),
  departmentId: fc.constantFrom('admin', 'tech', 'marketing', 'operations'),
  authorId: fc.uuid(),
  authorName: fc.fullName(),
  tags: fc.array(fc.string(), { maxLength: 10 }),
  attachments: fc.array(fileAttachmentArbitrary, { maxLength: 5 }),
  createdAt: fc.date().map(d => d.toISOString()),
  updatedAt: fc.date().map(d => d.toISOString()),
});
```

**Property Test Coverage**:
- All 36 correctness properties will have corresponding property-based tests
- Generators will create realistic test data matching domain constraints
- Tests will verify properties hold across wide input ranges
- Focus on invariants, round-trips, and filtering logic

### Integration Testing

**User Flow Tests**:
- Complete report creation flow
- Edit and save existing report
- Delete report with confirmation
- Filter by period and tag
- Generate AI summary
- Upload and remove attachments

**Permission Flow Tests**:
- Staff user permissions
- Dept Head permissions
- Super Admin permissions
- Cross-department access attempts

### Test Organization

```
src/
├── components/
│   └── reports/
│       ├── __tests__/
│       │   ├── ReportCard.test.tsx
│       │   ├── ReportForm.test.tsx
│       │   ├── RichTextEditor.test.tsx
│       │   └── ...
│       └── __properties__/
│           ├── reportFiltering.properties.test.ts
│           ├── reportPermissions.properties.test.ts
│           └── reportMetadata.properties.test.ts
├── lib/
│   └── reports/
│       └── __tests__/
│           ├── mockReportsApi.test.ts
│           ├── aiSummarizer.test.ts
│           └── reportPermissions.test.ts
└── test/
    ├── arbitraries/
    │   ├── reportArbitrary.ts
    │   ├── userArbitrary.ts
    │   └── fileArbitrary.ts
    └── integration/
        └── reportsFlow.test.tsx
```

### Testing Tools

- **Unit Tests**: Vitest + React Testing Library
- **Property Tests**: fast-check
- **Component Tests**: Vitest + React Testing Library
- **Integration Tests**: Vitest + React Testing Library
- **Mocking**: Vitest mocks for API calls
- **Coverage**: Vitest coverage (target: 80%+ for business logic)

### Continuous Testing

- Run unit tests on every commit
- Run property tests in CI pipeline
- Run integration tests before merge
- Generate coverage reports
- Fail build on test failures or coverage drops
