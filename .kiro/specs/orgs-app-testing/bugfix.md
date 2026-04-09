# Bugfix Requirements Document

## Introduction

This document captures all bugs, vulnerabilities, and broken behaviors identified during a comprehensive audit of the ORGs (Organizational Reports Gathering System) desktop app — a React + Electron application. The audit covered functionality, security, dead code, storage consistency, and Electron-specific configuration. Issues are grouped into five areas: Security Vulnerabilities, Broken/Inconsistent Code, Functionality Defects, Storage Sync Issues, and Electron Build Issues.

---

## Bug Analysis

### Current Behavior (Defect)

**Security**

1.1 WHEN the app renders HTML content from `storageService` documents in `WordEditor`, THEN the system sets `editorRef.current.innerHTML = doc.content` directly, allowing stored XSS if a document contains malicious HTML.

1.2 WHEN the formula engine evaluates arithmetic expressions in `SheetEditor`, THEN the system executes `Function('"use strict"; return (' + processedExpression + ')')()` with user-controlled cell reference values substituted in, enabling arbitrary code injection via crafted cell values.

1.3 WHEN any IPC handler in `electron/main.ts` receives a file path (`fs-read-file`, `fs-write-file`, `fs-delete-file`, `fs-copy-file`, etc.), THEN the system performs no path validation or sanitization, allowing path traversal attacks (e.g. `../../etc/passwd`) from a compromised renderer.

1.4 WHEN the app loads in Electron, THEN the system has no Content Security Policy defined — neither as a `<meta>` tag in `index.html` nor as a `webContents.session.webRequest` header in `main.ts` — leaving the app exposed to script injection.

1.5 WHEN `autosuggestionService` stores recent searches, THEN the system uses the localStorage key `'recentSearches'` (no `orgs_` prefix), inconsistent with the app's storage namespace convention.

1.6 WHEN `SearchContext` initializes the search index, THEN the system reads from `localStorage.getItem('workHistory')` and `localStorage.getItem('reports')` (no `orgs_` prefix), which are legacy keys that will always return empty arrays, making the search index permanently empty.

1.7 WHEN `SearchFilters` component renders, THEN the system reads `localStorage.getItem('departments')` (no `orgs_` prefix), which always returns an empty array, so the department filter is always empty.

**Functionality**

1.8 WHEN the user opens the Search page, THEN the system initializes `allFiles` from `fileIndexService.getAll()` in a `useEffect` with no dependency on file index changes, so newly uploaded files do not appear in search results until the page is remounted.

1.9 WHEN the user deletes a file from `SearchPage` or `FileBrowser`, THEN the system calls `fileIndexService.remove(entry.id)` but does not delete the physical file from disk (no call to `deleteFileEntry` from `documentManager`), leaving orphaned files on the filesystem.

1.10 WHEN the `BackupReminderBanner` is rendered outside the `BrowserRouter` in `App.tsx`, THEN the system renders the banner above the router, which is correct structurally, but the banner is not wrapped in `AnimatePresence`, so the exit animation defined with `framer-motion` never fires on dismiss.

1.11 WHEN the user is on the `FirstRunSetup` step 1 and clicks "Continue" without selecting a folder, THEN the system advances to step 2 regardless, because there is no validation guard on the Continue button — only `handleFinish` validates the folder.

1.12 WHEN the `InteractiveCalendar` or `DateFilesPanel` components render, THEN the system reads file data from `storageService` (the old localStorage-backed service) rather than `fileIndexService` (the IndexedDB-backed source of truth), causing the calendar to show stale or empty data after files are uploaded via the new pipeline.

1.13 WHEN the `WorkstationSelector` component renders editors, THEN the system renders `WordEditor` with a deprecated `document.execCommand` API that is marked as obsolete in all modern browsers and may silently fail in future Electron/Chromium versions.

1.14 WHEN the `AppSidebar` dark mode toggle is clicked, THEN the system always switches to either `'default'` or `'dark'` theme regardless of the user's currently active theme (e.g. `win11`, `neon`), discarding the user's theme selection.

1.15 WHEN the `Index.tsx` page is rendered (route not used in `App.tsx`), THEN the system displays a placeholder "Welcome to Your Blank App" message — this is dead/leftover scaffold code that should not exist in a production app.

**Storage Sync**

1.16 WHEN `fileIndexService.init()` completes and the index is empty, THEN the system syncs from `storageService.getFiles()`, but `storageService` uses `FileMetadata` objects that have a `type` field (`'video' | 'document' | 'image' | 'google-drive-link'`) while the sync code only checks `f.type === 'video'` for MIME type, mapping all non-video files to `'application/octet-stream'` and losing accurate MIME type information.

1.17 WHEN `restoreFromSyncFolder` adds restored files to `fileIndexService`, THEN the system sets `sizeBytes: 0` and `mimeType: ''` for all restored files because the restore function only has access to directory entries (names), not file metadata, resulting in incorrect size display and category detection for restored files.

**Electron Build**

1.18 WHEN `vite.config.ts` is used for a standard `vite build` (without `ELECTRON=true`), THEN the system sets `base: '/'` which is correct for web, but the electron-builder `files` array in `package.json` includes `dist-electron/**/*` without specifying that `main.js` / `preload.js` (the non-CJS outputs) are unnecessary artifacts, causing the packaged app to include redundant `.js` files alongside the `.cjs` files.

---

### Expected Behavior (Correct)

**Security**

2.1 WHEN `WordEditor` loads a saved document, THEN the system SHALL sanitize the stored HTML content before assigning it to `innerHTML`, or use a safe rendering approach (e.g. TipTap's `setContent` which already handles this) to prevent stored XSS.

2.2 WHEN the formula engine evaluates arithmetic expressions, THEN the system SHALL use a safe expression parser (e.g. a whitelist-based evaluator that only allows numbers and arithmetic operators) instead of `Function()` constructor, preventing code injection.

2.3 WHEN any IPC handler receives a file path argument, THEN the system SHALL validate that the resolved path is within an allowed base directory (primary folder or sync folder) before performing any filesystem operation, rejecting paths that escape the allowed scope.

2.4 WHEN the Electron app initializes, THEN the system SHALL set a Content Security Policy via `session.defaultSession.webRequest.onHeadersReceived` in `main.ts` that restricts `script-src` to `'self'` and disallows `eval` and inline scripts.

2.5 WHEN `autosuggestionService` reads or writes recent searches, THEN the system SHALL use the key `'orgs_recent_searches'` to be consistent with the `orgs_` namespace prefix used throughout the app.

2.6 WHEN `SearchContext` initializes the search index, THEN the system SHALL read from `'orgs_work_entries'` and integrate with `fileIndexService` to populate the index with actual app data, so search returns real results.

2.7 WHEN `SearchFilters` renders the department filter, THEN the system SHALL either remove the department filter (since ORGs is a single-user app with no departments) or read from a valid `orgs_` prefixed key.

**Functionality**

2.8 WHEN files are uploaded or deleted, THEN the `SearchPage` SHALL reflect the updated file list without requiring a page remount, by subscribing to `fileIndexService` changes or re-reading on focus/visibility.

2.9 WHEN the user deletes a file from `SearchPage` or `FileBrowser`, THEN the system SHALL call `deleteFileEntry(entry.id)` from `documentManager` to remove both the index entry and the physical file from disk.

2.10 WHEN the `BackupReminderBanner` is dismissed, THEN the system SHALL play the exit animation correctly by wrapping the conditional render in `AnimatePresence` at the `AppRoutes` level.

2.11 WHEN the user is on `FirstRunSetup` step 1 and clicks "Continue", THEN the system SHALL validate that `primaryFolder` is non-empty before advancing to step 2, showing an error toast if it is empty.

2.12 WHEN the `InteractiveCalendar` and `DateFilesPanel` components display file history, THEN the system SHALL read from `fileIndexService` (the IndexedDB source of truth) rather than `storageService`, so the calendar reflects all uploaded files accurately.

2.13 WHEN the `WordEditor` is used, THEN the system SHALL use the TipTap editor (already a project dependency via `@tiptap/react`) for rich text editing instead of the deprecated `document.execCommand` API.

2.14 WHEN the dark mode toggle in `AppSidebar` is clicked, THEN the system SHALL toggle between the current theme's dark variant and light variant, preserving the user's active theme family (e.g. toggling between `win11` and a dark equivalent) rather than always switching to `'default'`/`'dark'`.

2.15 WHEN the app is built for production, THEN the `Index.tsx` page SHALL be removed or replaced with a redirect to `/`, and the placeholder content SHALL NOT be visible to users.

**Storage Sync**

2.16 WHEN `fileIndexService` syncs from `storageService` on first load, THEN the system SHALL map MIME types accurately based on the file's `format` field and extension, not just the `type` field, so category detection is correct for all file types.

2.17 WHEN `restoreFromSyncFolder` adds files to `fileIndexService`, THEN the system SHALL attempt to read actual file size from the filesystem via `fs-read-file` or a dedicated `fs-stat` IPC call, and SHALL set `mimeType` based on the file extension, so restored files display correct metadata.

**Electron Build**

2.18 WHEN the app is packaged with `electron-builder`, THEN the `package.json` build config SHALL exclude `dist-electron/*.js` and `dist-electron/*.js.map` (the non-CJS outputs) from the packaged files, keeping only the `.cjs` files that Electron actually loads.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN the user uploads a file via drag-and-drop or file picker in `FileUploadZone`, THEN the system SHALL CONTINUE TO register the file in `fileIndexService`, copy it to the primary folder (in Electron mode), and optionally sync it to the backup folder.

3.2 WHEN the user completes the first-run setup wizard, THEN the system SHALL CONTINUE TO persist `orgs_primary_folder`, `orgs_sync_folder`, and `orgs_setup_complete` to localStorage and skip the wizard on subsequent launches.

3.3 WHEN the user selects a theme from the Settings appearance tab, THEN the system SHALL CONTINUE TO apply all CSS variables for that theme and persist the selection to `orgs_theme` and `orgs_accent` in localStorage.

3.4 WHEN the app starts, THEN the system SHALL CONTINUE TO call `fileIndexService.init()` to hydrate the in-memory cache from IndexedDB before any component reads file data.

3.5 WHEN the user creates a note in `MessagesPage`, THEN the system SHALL CONTINUE TO persist notes to `orgs_messages` in localStorage and display them with unread badges.

3.6 WHEN the user creates a reminder in `EventsPage`, THEN the system SHALL CONTINUE TO persist reminders to `orgs_reminders` in localStorage and highlight reminder dates on the calendar.

3.7 WHEN the backup reminder system runs its hourly check on a weekend with a stale backup, THEN the system SHALL CONTINUE TO show the `BackupReminderBanner` and send a desktop notification.

3.8 WHEN the user clicks "Back up now" in the `BackupReminderBanner`, THEN the system SHALL CONTINUE TO call `triggerBackupNow()` which copies all `local`-status files to the sync folder and updates their status to `synced`.

3.9 WHEN the user clicks "Restore Files" in Settings, THEN the system SHALL CONTINUE TO copy files from the sync folder back to the primary folder and re-register them in `fileIndexService`.

3.10 WHEN the app runs in a browser (non-Electron) context, THEN the system SHALL CONTINUE TO function in degraded mode — file operations SHALL gracefully no-op via the `isElectron()` guards in `electronBridge.ts`.

3.11 WHEN `contextIsolation: true` and `nodeIntegration: false` are set in `BrowserWindow` webPreferences, THEN the system SHALL CONTINUE TO expose only the explicitly whitelisted `electronAPI` surface via `contextBridge`, with no direct Node.js access from the renderer.

3.12 WHEN the `FileBrowser` displays files, THEN the system SHALL CONTINUE TO support list/grid view toggle, sort by name/date/size/type, category filter pills, and search by name/type/date.
