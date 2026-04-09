# Implementation Tasks

## Task List

- [x] 1. Electron Setup
  - [x] 1.1 Install electron, electron-builder, and vite-plugin-electron as dev dependencies
  - [x] 1.2 Create `electron/main.ts` — BrowserWindow setup, app lifecycle, window state persistence
  - [x] 1.3 Create `electron/preload.ts` — contextBridge exposing `window.electronAPI`
  - [x] 1.4 Create `electron/ipc/fileSystem.ts` — IPC handlers for selectDirectory, readFile, writeFile, deleteFile, renameFile, ensureDir, openWithDefault
  - [x] 1.5 Create `electron/ipc/oauth.ts` — IPC handlers for OAuth PKCE flow and token refresh
  - [x] 1.6 Create `electron/ipc/notifications.ts` — IPC handler for desktop notifications
  - [x] 1.7 Create `electron/ipc/updater.ts` — auto-updater IPC handler
  - [x] 1.8 Create `src/lib/electron/electronBridge.ts` — type-safe wrapper around `window.electronAPI`
  - [x] 1.9 Update `vite.config.ts` to support Electron renderer build
  - [x] 1.10 Add `electron:dev` and `electron:build` scripts to `package.json`

- [x] 2. App Rebrand to ORGs
  - [x] 2.1 Replace all "CASI 360" and "Care and Support Initiative 360" text in all source files with "ORGs" / "Organizational Reports Gathering System"
  - [x] 2.2 Update `index.html` title and meta tags to ORGs
  - [x] 2.3 Update app name in `package.json`
  - [x] 2.4 Update navigation headers, sidebar, and splash/login screen branding
  - [x] 2.5 Replace favicon and any logo assets with ORGs branding

- [x] 3. Remove Attendance and Reports Modules
  - [x] 3.1 Delete `src/components/attendance/` directory and all files
  - [x] 3.2 Delete `src/components/admin/AttendanceTab.tsx` and `AttendanceApprovalTab.tsx`
  - [x] 3.3 Delete `src/components/reports/` directory and all files
  - [x] 3.4 Delete `src/context/AttendanceContext.tsx` and `src/context/ReportsContext.tsx`
  - [x] 3.5 Delete `src/hooks/useReports.ts`
  - [x] 3.6 Delete `src/lib/reports/` directory
  - [x] 3.7 Remove Attendance and Reports routes from `src/App.tsx`
  - [x] 3.8 Remove Attendance and Reports navigation links from layout components
  - [x] 3.9 Remove all imports and references to deleted modules across the codebase

- [ ] 4. File Index Service
  - [ ] 4.1 Install `idb` package for IndexedDB access
  - [ ] 4.2 Create `src/lib/fileIndex/fileIndexDb.ts` — IndexedDB schema, open/upgrade logic
  - [ ] 4.3 Create `src/lib/fileIndex/fileIndexService.ts` — insert, update, delete, getById, getAll, getByDate, persist/reload
  - [ ] 4.4 Create `src/lib/fileIndex/types.ts` — `FileIndexEntry`, `FileOwnershipMetadata`, `StorageProviderConfig` TypeScript interfaces
  - [ ] 4.5 Write unit tests for fileIndexService (insert, delete, update, persist/reload cycle)

- [ ] 5. Document Manager
  - [ ] 5.1 Create `src/lib/documentManager/documentManager.ts` — uploadFile, deleteFile, renameFile, moveFile, queueCloudBackup, restoreFromCloud
  - [ ] 5.2 Implement `resolveFormatFolder` — maps file extension to uppercase Format_Folder name
  - [ ] 5.3 Implement `ensureFormatFolder` — calls `electronAPI.ensureDir` to create folder if missing
  - [ ] 5.4 Implement `resolveUniqueFileName` — appends numeric suffix on name collision
  - [ ] 5.5 Implement upload pipeline: validate extension → ensureFormatFolder → resolveUniqueFileName → writeFile → insertFileIndex → queueBackup
  - [ ] 5.6 Write unit tests for resolveUniqueFileName (0, 1, N duplicates) and resolveFormatFolder

- [ ] 6. Local Storage Provider
  - [ ] 6.1 Create `src/lib/storage/localStorageProvider.ts` — wraps electronAPI file system calls
  - [ ] 6.2 Implement directory picker UI in Settings page using `electronAPI.selectDirectory`
  - [ ] 6.3 Persist `LocalStorageConfig` (rootPath, configuredAt) to localStorage
  - [ ] 6.4 Load and validate local root path on app startup

- [ ] 7. Sync Folder Backup Configuration
  - [ ] 7.1 Add Sync_Folder path picker in Settings using `electronAPI.selectDirectory`
  - [ ] 7.2 Persist Sync_Folder path in localStorage alongside Primary_Folder config
  - [ ] 7.3 After each file upload to Primary_Folder, copy file to matching Format_Folder inside Sync_Folder
  - [ ] 7.4 IF Sync_Folder is not set or path is inaccessible, skip backup silently and show a warning badge in Settings
  - [ ] 7.5 Show "Backed up" / "Not backed up" status indicator per file in the file list

- [ ] 8. First-Run Setup
  - [ ] 8.1 On first launch (no Primary_Folder configured), show a setup screen with a folder picker
  - [ ] 8.2 Allow user to optionally set a Sync_Folder on the same setup screen
  - [ ] 8.3 After folder selection, persist config to localStorage and navigate directly to main app
  - [ ] 8.4 Remove all login/auth routes, guards, and context from the app
  - [ ] 8.5 Remove AuthGuard — all routes are freely accessible

- [ ] 12. Global File Search
  - [ ] 12.1 Extend `src/lib/search/searchIndexService.ts` to index `FileIndexEntry` fields (name, extension, uploadedAt)
  - [ ] 12.2 Implement tokenization — split on non-alphanumeric + camelCase boundaries, generate 2-3 char n-grams
  - [ ] 12.3 Implement query pipeline — token lookup → filter by extension/date → score → sort → paginate
  - [ ] 12.4 Rebuild search index from FileIndex on app startup, update incrementally on upload/rename/delete
  - [ ] 12.5 Update `src/components/search/SearchBar.tsx` to query FileIndex entries
  - [ ] 12.6 Update `src/components/search/SearchResultCard.tsx` to display file name, format, upload date, storage location
  - [ ] 12.7 Write property-based test: search returns results within 500ms for 10,000 files (P8)
  - [ ] 12.8 Write property-based test: search correctness — name/format/date matching (P9)

- [ ] 13. Calendar Upload History View
  - [ ] 13.1 Update `src/components/dashboard/InteractiveCalendar.tsx` to query FileIndex grouped by uploadedAt date
  - [ ] 13.2 Highlight calendar dates that have at least one uploaded file
  - [ ] 13.3 On date click, show list of files uploaded that day sorted ascending by uploadedAt time
  - [ ] 13.4 Display upload time alongside each file entry in the date detail list
  - [ ] 13.5 Write property-based test: calendar highlight correctness (P11)
  - [ ] 13.6 Write property-based test: calendar date detail ordering (P12)

- [ ] 14. One-Click File Access (File Viewer)
  - [ ] 14.1 Create `src/lib/fileViewer/fileViewer.ts` — route to correct viewer based on file extension
  - [ ] 14.2 ORGs-native files (.orgs-doc, .orgs-sheet, .orgs-design) → navigate to corresponding editor with fileId state
  - [ ] 14.3 Local non-native files → call `electronAPI.openWithDefault(localPath)`
  - [ ] 14.4 Cloud files → open cloud provider native viewer in Electron BrowserWindow
  - [ ] 14.5 Show loading indicator while file is being retrieved
  - [ ] 14.6 Show descriptive error if file cannot be opened

- [ ] 15. File Management Operations
  - [ ] 15.1 Add rename action to file list — inline edit, calls `documentManager.renameFile`
  - [ ] 15.2 Add delete action to file list — confirmation dialog, calls `documentManager.deleteFile`
  - [ ] 15.3 Add move action to file list — Format_Folder picker, calls `documentManager.moveFile`
  - [ ] 15.4 Ensure all operations update both Storage_Provider and FileIndex atomically
  - [ ] 15.5 Write property-based test: rename propagates to index and storage (P25)
  - [ ] 15.6 Write property-based test: move updates index path (P26)

- [ ] 16. Weekend Backup Reminder System
  - [ ] 16.1 Create `src/lib/backup/backupReminderSystem.ts` — hourly check, Saturday/Sunday detection, online/offline detection
  - [ ] 16.2 Show persistent in-app alert when reminder conditions are met (offline + weekend + backup > 7 days old)
  - [ ] 16.3 "Back up now" button in alert triggers immediate backup of all pending files
  - [ ] 16.4 Update `lastBackupTimestamp` in localStorage after successful backup
  - [ ] 16.5 Add reminders toggle in Settings
  - [ ] 16.6 Write property-based test: backup staleness detection (P13)
  - [ ] 16.7 Write property-based test: weekend-only reminder firing (P14)

- [ ] 17. Productivity Tools Save-to-Storage Integration
  - [ ] 17.1 Update `src/components/dashboard/WordEditor.tsx` save action to call `documentManager.uploadFile` with `.orgs-doc` extension
  - [ ] 17.2 Update `src/components/dashboard/SheetEditor.tsx` save action to call `documentManager.uploadFile` with `.orgs-sheet` extension
  - [ ] 17.3 Update `src/components/dashboard/DesignEditor.tsx` save action to call `documentManager.uploadFile` with `.orgs-design` extension
  - [ ] 17.4 On opening an ORGs-native file from FileViewer, load its content into the corresponding editor

- [ ] 18. File Upload UI
  - [ ] 18.1 Update `src/components/dashboard/FileUploadZone.tsx` to use `documentManager.uploadFile`
  - [ ] 18.2 Show per-file upload progress bar
  - [ ] 18.3 Show success/error toast per file after upload completes
  - [ ] 18.4 Display file list panel showing all FileIndex entries grouped by Format_Folder

- [ ] 9. Sync Folder Restoration
  - [ ] 9.1 Add "Restore from Sync Folder" button in Settings
  - [ ] 9.2 On trigger, scan Sync_Folder recursively and copy all files to Primary_Folder matching Format_Folder structure
  - [ ] 9.3 Rebuild FileIndex entries for all restored files
  - [ ] 9.4 Show progress indicator during restoration
  - [ ] 9.5 Mark files as `storageStatus: 'restoration_failed'` if copy fails
  - [ ] 19.1 On app startup, scan all FileIndex entries with a localPath and verify the file exists on disk
  - [ ] 19.2 Mark entries as `storageStatus: 'missing'` if file not found at stored path
  - [ ] 19.3 Show visual indicator (warning icon) on missing files in file list and search results
  - [ ] 19.4 Write property-based test: missing file marked in index (P24)

- [ ] 20. Electron Packaging and Auto-Updater
  - [ ] 20.1 Create `electron-builder.config.js` — app id, product name, icons, targets for Windows (NSIS), macOS (dmg), Linux (AppImage + deb)
  - [ ] 20.2 Configure auto-updater in `electron/ipc/updater.ts` using `electron-updater`
  - [ ] 20.3 Show in-app notification when update is available with "Install and restart" button
  - [ ] 20.4 Persist window size and position using `electron-window-state` or equivalent
  - [ ] 20.5 Register `orgs://` URI scheme for OAuth callbacks in electron-builder config

- [ ] 21. Property-Based Tests (fast-check)
  - [ ] 21.1 Install `fast-check` dev dependency
  - [ ] 21.2 Write P1: Storage config round trip
  - [ ] 21.3 Write P2: Failed backup enqueues file
  - [ ] 21.4 Write P3: Supported format upload succeeds
  - [ ] 21.5 Write P4: Upload metadata completeness
  - [ ] 21.6 Write P5: Duplicate file names get unique suffixes
  - [ ] 21.7 Write P6: Format_Folder placement
  - [ ] 21.8 Write P7: Format_Folder idempotence
  - [ ] 21.9 Write P16: Cross-device file retrieval by owner
  - [ ] 21.10 Write P18: Unauthenticated state blocks file access
  - [ ] 21.11 Write P19: Token refresh before expiry
  - [ ] 21.12 Write P21: File_Index updated atomically on upload
  - [ ] 21.13 Write P22: File_Index entry removed on delete
  - [ ] 21.14 Write P23: File_Index persists across restarts
