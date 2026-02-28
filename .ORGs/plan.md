

# 🧠 Casi360 — Internal Web Dashboard

## Phase 1: Foundation & Design System
- Custom color theme: deep navy (`#0f172a`) sidebar, emerald (`#10b981`) accents, warm off-white (`#f8fafc`) content
- Google Fonts: DM Sans (body) + Sora (headings)
- Collapsible sidebar with icon-label links, department tree with expandable subdepartments
- Top header bar with logo, page title, live clock widget (digital/analog toggle, Nigeria WAT time), and user avatar dropdown
- Role-based sidebar: department users see only their dept; Super Admin sees all

## Phase 2: Authentication & Routing
- Login page with email + password fields, styled with the Casi360 brand
- 7 pre-seeded demo accounts with role-based redirect after login
- Protected routes — unauthenticated users redirected to login
- Auth context storing current user, department, and role
- Permission system controlling visibility of admin panel, event creation, cross-department access

## Phase 3: Homepage Dashboard
- **Work History** — filterable table/card list of uploads (by name, file ID, format, date, A-Z sorting)
- **Interactive Calendar** — monthly view with Nigerian public holidays highlighted, emerald dots on dates with uploads, click-to-open slide-over panel showing that date's files
- **Live Clock Widget** — smooth animated toggle between digital (HH:MM:SS) and analog (SVG) clock faces
- **Workstation Selector** — three styled cards (Word/Sheet/Design) opening inline editors for rich text, basic spreadsheet, and design notes, with save-to-database action
- **File Upload** — drag-and-drop zone accepting PDF, DOCX, XLSX, JPG, PNG, video links; metadata preview/edit before saving

## Phase 4: Reports Module ✅ COMPLETED
- Department and subdepartment report pages with 5 period tabs: Daily, Weekly, Monthly, Quarterly, Annual
- Report cards showing title, date, author, with edit/delete actions
- Create report form (title, content, period, tags, file attachments)
- AI Summarize button on each report (2-second delay, mock AI response with bullet points)
- Role-based permissions (Super Admin, Dept Head, Staff)
- Tag-based filtering and categorization
- File upload with drag-and-drop (PDF, DOCX, XLSX, PNG, JPG, TXT)

## Phase 5: Enhanced Dashboard & Workstation
- **Work History Enhancement**: Add edit/delete actions directly on cards
- **Workstation Selector**: Implement actual editors for Word/Sheet/Design with save functionality
- **Calendar Enhancement**: Make calendar interactive with click-to-view files for each date
- **File Upload Enhancement**: Add support for Google Drive video links and direct video uploads
- **Video Player**: Embed video player for uploaded videos (not public streaming platforms)

## Phase 6: Search & AI Summarizer
- Global search bar in header with autosuggestions dropdown and autocomplete
- Filters: name, file ID, format, department, date range
- Results grouped by Documents, Reports, Messages
- ✨ AI Summary button on all documents, images, and reports — opens modal/side panel with mock AI-generated summary
- Search across all content types (reports, files, messages)

## Phase 7: Messaging System
- Left pane: user list with department badges, online/offline status dots (simulated with timer)
- Right pane: chat window with message bubbles, file attachment support
- Intra-department group chat channels
- Inter-department direct messaging (P2P)
- File/link sharing in messages
- Online status indicators
- All powered by realistic mock conversation data

## Phase 8: Timetable & Events
- Calendar + list view of upcoming events
- Events tagged as Departmental or General with pill badges
- Create event button (Super Admin / dept heads only)
- Event cards with title, date/time, location, type badge, description
- Integration with main calendar to show events

## Phase 9: Settings & User Management
- **Settings Page**: 
  - Profile tab: photo upload (LinkedIn-style), locked name/email/User ID display
  - Security tab: change password (users can change their own password)
  - Preferences tab: clock style toggle (digital/analog), light/dark theme toggle
- **User Profile**: Display user info, department, role, job title

## Phase 10: Super Admin Panel
- **Super Admin Panel** (visible only to Super Admin):
  - Users tab: full user table with create, edit, reset password, deactivate/delete
  - Departments tab: tree view with add/rename/delete departments and subdepartments
  - System tab: reset app button with confirmation, save org settings, mock system logs
  - Full control over all departments and content

## Design & UX Polish (Throughout)
- Subtle card shadows, 200ms ease transitions on all interactions
- Smooth sidebar collapse/expand animations
- Pill-shaped department badges with department-specific colors
- Fade + slide transitions on all modals and slide-over panels
- Desktop-first layout, functional on tablets
- Dark mode support via theme toggle

