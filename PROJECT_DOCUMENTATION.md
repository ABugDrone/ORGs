# ORGs - Organizational Reports Gathering System
## Complete Project Documentation

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [System Architecture](#system-architecture)
4. [Core Features](#core-features)
5. [Module Documentation](#module-documentation)
6. [Installation & Setup](#installation--setup)
7. [Development Guidelines](#development-guidelines)
8. [Security & Data Management](#security--data-management)

---

## Project Overview

### Description
ORGs (Organizational Reports Gathering System) is a desktop file organization system that helps users manage, organize, and access all their documents in one place. Files are automatically sorted into format-based folders on the local PC, with optional cloud backup to Google Drive or Microsoft OneDrive. The app provides instant file access via global search, one-click opening, and a calendar-based upload history view. It is packaged as an installable desktop application using Electron.

### Vision
A single organized desktop file system inside one app — no more hunting through folders. Every file is one search or one click away, with cloud backup ensuring nothing is ever lost.

### Key Objectives
- Automatically organize files into format-based subfolders (PDF/, DOCX/, MP4/, etc.)
- Provide instant file access via global search and calendar history
- Use cloud storage (Google Drive / OneDrive) as backup with weekend reminders
- Secure file access via cloud account login (Google / Microsoft)
- Enable seamless cross-device file restoration with automatic configuration
- Package as an installable Electron desktop app for Windows, macOS, and Linux

---

## Technology Stack

### Desktop Shell
- **Electron** - Chromium-based desktop application wrapper
- **electron-builder** - Cross-platform installer packaging (.exe, .dmg, .AppImage)

### Frontend Framework
- **React 18.3.1** - UI library
- **TypeScript 5.8.3** - Type-safe JavaScript
- **Vite 5.4.19** - Build tool and development server

### UI & Styling
- **Tailwind CSS 3.4.17** - Utility-first CSS framework
- **shadcn/ui** - Accessible component library
- **Radix UI** - Unstyled accessible component primitives
- **Framer Motion 12.34.3** - Animations
- **Lucide React 0.462.0** - Icon library

### State Management & Data
- **React Context API** - Global state management
- **IndexedDB** - File index persistence (via idb)
- **Electron safeStorage** - Secure token storage (OS keychain)

### Routing & Navigation
- **React Router DOM 6.30.1** - Client-side routing

### Rich Text & Editors
- **TipTap 3.20.0** - Rich text editor (Word Editor)
- **Canvas API** - Design editor

### Cloud Integration
- **Google Drive API** - Cloud backup (OAuth 2.0 + PKCE)
- **Microsoft Graph API** - OneDrive backup (OAuth 2.0 + MSAL)

### Form Handling
- **React Hook Form 7.61.1** - Form management
- **Zod 3.25.76** - Schema validation

### Date & Time
- **date-fns 3.6.0** - Date utilities
- **React Day Picker 8.10.1** - Date picker

### Testing
- **Vitest 3.2.4** - Unit and property-based testing
- **fast-check** - Property-based testing
- **Testing Library** - Component testing

### Additional Libraries
- **Recharts 2.15.4** - Data visualization
- **Sonner 1.7.4** - Toast notifications

---

## System Architecture

### Application Structure
```
orgs/
├── electron/
│   ├── main.ts              # Electron main process entry point
│   ├── preload.ts           # Context bridge (window.electronAPI)
│   └── ipc/
│       ├── fileSystem.ts    # File system IPC handlers
│       ├── oauth.ts         # OAuth flow IPC handlers
│       ├── notifications.ts # Desktop notification handlers
│       └── updater.ts       # Auto-update handlers
├── src/                     # React renderer process
│   ├── components/
│   │   ├── dashboard/       # File list, calendar, upload zone
│   │   ├── search/          # Global search bar and results
│   │   ├── editors/         # Word, Sheet, Design editors
│   │   ├── layout/          # App shell and navigation
│   │   └── ui/              # Base UI components (shadcn)
│   ├── context/             # React Context providers
│   ├── hooks/               # Custom React hooks
│   ├── lib/
│   │   ├── electron/        # IPC bridge wrapper
│   │   ├── fileIndex/       # IndexedDB file registry
│   │   ├── search/          # Search indexing and query
│   │   ├── cloud/           # Cloud backup and OAuth
│   │   ├── storage/         # Local storage service
│   │   └── validation/      # Input validation
│   ├── pages/               # Page components
│   └── types/               # TypeScript type definitions
├── public/                  # Static assets
└── .kiro/specs/             # Feature specifications
```

### Data Flow
1. **File Upload** → Document_Manager validates → written to Format_Folder → File_Index updated → queued for cloud backup
2. **File Search** → Search_Engine queries File_Index → results ranked → File_Viewer opens selected file
3. **Cloud Backup** → Backup Queue dequeues → Cloud_Security verifies auth → file uploaded → File_Index updated
4. **Cross-Device Restore** → User logs in → Cloud_Security verifies → files downloaded → Format_Folders recreated → File_Index rebuilt

### Key Data Models

#### FileIndexEntry
```typescript
interface FileIndexEntry {
  id: string;                  // UUID v4
  name: string;
  extension: string;           // Uppercase, e.g. "PDF"
  mimeType: string;
  sizeBytes: number;
  localPath: string | null;
  cloudPath: string | null;
  formatFolder: string;
  storageStatus: 'local_only' | 'backed_up' | 'cloud_only' | 'missing' | 'restoration_failed';
  uploadedAt: string;          // ISO 8601
  lastBackedUpAt: string | null;
  ownership: FileOwnershipMetadata;
}
```

#### FileOwnershipMetadata
```typescript
interface FileOwnershipMetadata {
  cloudAccountId: string;      // Google sub or Microsoft oid
  cloudProvider: 'google' | 'microsoft';
  deviceId: string;            // Stable per-device ID
  uploadedAt: string;
  ownerDisplayName: string;
}
```

---

## Core Features

### 1. File Upload & Organization
- Drag-and-drop or file picker upload
- Supports PDF, DOCX, XLSX, PPTX, TXT, CSV, PNG, JPG, JPEG, GIF, SVG, MP4, MOV, AVI, ZIP
- Files automatically placed in Format_Folders (PDF/, DOCX/, MP4/, etc.)
- Duplicate names resolved with numeric suffix (e.g. `report (1).pdf`)
- Upload progress indicator per file

### 2. Global File Search
- Single search bar in the navigation header, available on all pages
- Searches by file name, format/type, and upload date
- Partial and case-insensitive matching
- Results returned within 500ms for up to 10,000 files
- Clicking a result opens the file immediately

### 3. Calendar Upload History
- Monthly calendar grid with highlights on dates that have uploaded files
- Click a date to see all files uploaded that day, sorted by time
- Click any file in the date list to open it
- Navigate between months with previous/next controls

### 4. One-Click File Access
- Click any file in the list, search results, or calendar to open it
- Local files open with the OS default application via Electron
- Cloud files open in the cloud provider's native viewer in-app
- ORGs-native files (.orgs-doc, .orgs-sheet, .orgs-design) open in the built-in editors

### 5. Cloud Backup
- Google Drive and Microsoft OneDrive supported as backup destinations
- Files backed up automatically in the background after upload
- Backup Queue with retry policy (exponential backoff, max 5 attempts)
- Cloud folder mirrors the local Format_Folder structure

### 6. Weekend Backup Reminders
- Detects when the last backup was more than 7 days ago
- Shows a persistent in-app alert on Saturday or Sunday when offline
- "Back up now" button initiates immediate backup
- Reminders can be disabled in settings

### 7. Cloud Account Security
- Google or Microsoft account login is the primary security mechanism
- All file operations require a valid authenticated session
- Access tokens held in memory only; refresh tokens stored in OS keychain via Electron safeStorage
- File downloads revoked if cloud account authentication fails
- Session expiry triggers immediate logout and access revocation

### 8. Cross-Device File Restoration
- Log in on any device with the same cloud account to restore all files
- Format_Folder structure recreated automatically
- File ownership metadata preserved through backup and restore
- Storage configuration (local root path) restored from cloud config file
- Progress indicator shown during restoration

### 9. File Management
- Rename files from within the app
- Delete files with confirmation prompt
- Move files between Format_Folders
- All operations update both the Storage_Provider and File_Index atomically

### 10. Productivity Tools
#### Word Editor
- Rich text editing: bold, italic, underline, headings, alignment, lists
- Undo/redo, save to storage (registered in File_Index)

#### Sheet Editor
- Spreadsheet grid with cell editing
- Formula support: SUM, AVERAGE, COUNT, MIN, MAX
- Real-time auto-calculation, save to storage

#### Design Editor
- Freehand canvas drawing
- Color picker, adjustable brush size, canvas clear
- Notes section, save to storage

#### Video Player
- In-app playback for uploaded video files (MP4, MOV, AVI)

#### Events Calendar
- Create and view events with title, description, date, time, location
- Filter by date, upcoming events list

#### Messaging
- Internal messaging with file sharing
- Online status indicators, unread badges

---

## Module Documentation

### Document_Manager
**Responsibilities**: File upload, Format_Folder creation, rename, move, delete, cloud backup dispatch

```typescript
interface DocumentManager {
  uploadFile(file: File, config: StorageProviderConfig): Promise<FileIndexEntry>;
  deleteFile(fileId: string): Promise<void>;
  renameFile(fileId: string, newName: string): Promise<FileIndexEntry>;
  moveFile(fileId: string, targetFolder: string): Promise<FileIndexEntry>;
  queueCloudBackup(fileId: string): Promise<void>;
  restoreFromCloud(accountId: string): Promise<RestorationResult>;
}
```

### Search_Engine
**Responsibilities**: File index querying, tokenization, ranking

```typescript
interface SearchEngine {
  indexFile(entry: FileIndexEntry): void;
  removeFromIndex(fileId: string): void;
  query(q: SearchQuery): SearchResult[];
  rebuildIndex(entries: FileIndexEntry[]): void;
}
```

### Cloud_Security
**Responsibilities**: OAuth 2.0 token lifecycle, session verification, access revocation

```typescript
interface CloudSecurity {
  authenticate(provider: CloudProvider): Promise<AuthSession>;
  verifySession(session: AuthSession): Promise<boolean>;
  refreshIfExpiring(session: AuthSession): Promise<AuthSession>;
  revokeSession(session: AuthSession): Promise<void>;
  isAuthenticated(): boolean;
}
```

### Backup_Reminder_System
**Responsibilities**: Weekend backup reminders, last backup tracking

```typescript
interface BackupReminderSystem {
  checkAndNotify(): Promise<void>;
  getLastBackupTimestamp(): Date | null;
  updateLastBackupTimestamp(): void;
  isRemindersEnabled(): boolean;
  setRemindersEnabled(enabled: boolean): void;
}
```

### Electron IPC Bridge (`window.electronAPI`)
```typescript
interface ElectronAPI {
  selectDirectory(): Promise<string | null>;
  readFile(path: string): Promise<Buffer>;
  writeFile(path: string, data: Buffer): Promise<void>;
  deleteFile(path: string): Promise<void>;
  renameFile(oldPath: string, newPath: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  openWithDefault(path: string): Promise<void>;
  startOAuthFlow(provider: 'google' | 'microsoft'): Promise<OAuthTokens>;
  refreshToken(provider: 'google' | 'microsoft', refreshToken: string): Promise<OAuthTokens>;
  storeSecret(key: string, value: string): Promise<void>;
  retrieveSecret(key: string): Promise<string | null>;
  deleteSecret(key: string): Promise<void>;
  showNotification(title: string, body: string): Promise<void>;
}
```

---

## Installation & Setup

### Prerequisites
- Node.js 18+ or Bun runtime
- npm, yarn, or bun package manager

### Development Setup

1. **Clone the Repository**
```bash
git clone <repository-url>
cd orgs
```

2. **Install Dependencies**
```bash
npm install
```

3. **Start Development (Electron + React)**
```bash
npm run electron:dev
```

4. **React-only (browser preview)**
```bash
npm run dev
```

### Build Desktop Installer

```bash
# Windows (.exe)
npm run electron:build:win

# macOS (.dmg)
npm run electron:build:mac

# Linux (.AppImage / .deb)
npm run electron:build:linux
```

### Run Tests
```bash
npm run test          # single run
npm run test:watch    # watch mode
```

---

## Development Guidelines

### Code Style
- TypeScript throughout — no `any` types
- Functional React components with hooks
- All file operations go through the IPC bridge, never direct Node.js calls from renderer
- Keep renderer process free of privileged APIs

### Component Structure
```typescript
// 1. Imports
import { useDocumentManager } from '@/lib/electron/electronBridge';

// 2. Types
interface ComponentProps { ... }

// 3. Component
export function Component({ props }: ComponentProps) {
  // hooks → effects → handlers → render
}
```

### IPC Security Rules
- Never enable `nodeIntegration` in renderer
- Always use `contextBridge` in preload.ts
- Validate all IPC inputs in the main process before executing

### Styling
- Tailwind utility classes
- Mobile-first, then desktop breakpoints
- Use existing design system tokens (colors, spacing, typography)

---

## Security & Data Management

### Authentication
- Cloud account (Google / Microsoft) is the only login method
- Access tokens: renderer memory only, never written to disk
- Refresh tokens: encrypted via `electron.safeStorage`, stored at `<userData>/tokens/<provider>.enc`
- Device ID: generated once, stored in safeStorage permanently

### Token Lifecycle

| Token | Storage | Lifetime | Refresh |
|---|---|---|---|
| Access Token | Renderer memory | ~1 hour | 5 min before expiry |
| Refresh Token | safeStorage encrypted file | Long-lived | On access token expiry |
| Device ID | safeStorage | Permanent | Never |

### File Access Control
- All routes wrapped in `AuthGuard` — unauthenticated users see only the login screen
- On logout or session expiry: access token cleared, all file operations blocked, user redirected to login
- Cloud file downloads rejected if auth token cannot be verified

### Data Persistence
- **File_Index**: IndexedDB (renderer process) — survives app restarts
- **Backup Queue**: IndexedDB — survives crashes, retried on next launch
- **Storage Config**: localStorage — local root path and cloud provider settings
- **Auth Tokens**: Electron safeStorage — OS-level encryption

### Backup & Restore
- Cloud backup folder: `ORGs Backup/` in the user's Google Drive or OneDrive
- Format_Folder structure mirrored in cloud
- `orgs-config.json` stored in cloud root — contains local storage config for restoration
- Ownership metadata stored as custom file properties on each cloud file

---

## Future Enhancements

1. Multi-account support (switch between Google and Microsoft simultaneously)
2. File versioning and history
3. Shared folders between users
4. Advanced search filters (size range, date range, tags)
5. Bulk file operations (multi-select upload, delete, move)
6. Mobile companion app for remote file access

---

## License & Credits

### Project Information
- **Project Name**: ORGs — Organizational Reports Gathering System
- **Version**: 2.0.0
- **Description**: Desktop file organization system with cloud backup

### Technologies Used
- Electron, React, TypeScript, Vite
- Tailwind CSS, shadcn/ui, Radix UI
- Google Drive API, Microsoft Graph API
- TipTap, Canvas API, date-fns
- Vitest, fast-check

---

**Document Version**: 2.0
**Last Updated**: 2026-04-02
**Maintained By**: ORGs Development Team
