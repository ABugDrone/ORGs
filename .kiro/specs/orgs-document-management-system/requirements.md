# Requirements Document

## Introduction

ORGs is a desktop file organization system that helps users organize and manage files on their local PC with optional sync folder backup. The system provides automatic file organization into format-based subfolders, unified file access via global search and one-click opening, and a calendar-based upload history view. There is no login or authentication — the app opens directly. Cloud backup works by writing files to a user-configured sync folder (e.g. `~/Google Drive/ORGs Backup`) — the cloud sync client handles uploading automatically. Weekend reminders notify users to ensure their sync folder is up to date. The app retains all existing productivity tools (Word Editor, Sheet Editor, Design Editor, Video Player, Events Calendar, Messaging) and is packaged as an installable desktop application using Electron.

---

## Glossary

- **ORGs**: A desktop file organization system for managing files with cloud sync folder backup.
- **Document_Manager**: The subsystem responsible for file upload, storage routing, and folder organization.
- **Primary_Folder**: The user-selected local PC directory where files are stored and organized.
- **Sync_Folder**: An optional user-configured folder path that is already synced by Google Drive for Desktop or OneDrive — the app writes backup copies here and the sync client handles uploading.
- **File_Index**: The internal registry that tracks metadata (name, type, upload date/time, storage path) for every file.
- **Format_Folder**: An automatically created subfolder named after a file's format/type (e.g., `PDF/`, `DOCX/`, `MP4/`, `PNG/`).
- **File_Viewer**: The in-app component that opens and displays a file without leaving the application.
- **Calendar_View**: The calendar-based UI that highlights dates on which files were uploaded.
- **Search_Engine**: The global search subsystem that queries the File_Index.
- **Electron_Shell**: The Electron wrapper that packages the React application as an installable desktop app.
- **Word_Editor**: The existing rich-text document editor (TipTap-based).
- **Sheet_Editor**: The existing spreadsheet editor with formula support.
- **Design_Editor**: The existing canvas-based drawing and design editor.
- **Video_Player**: The existing in-app video playback component.
- **Productivity_Tools**: The collective set of existing tools including Word_Editor, Sheet_Editor, Design_Editor, Video_Player, Events Calendar, and Messaging.
- **Backup_Reminder_System**: The subsystem that sends weekend notifications reminding users to ensure their Sync_Folder is up to date.

---

## Requirements

### Requirement 1: App Rebrand to ORGs

**User Story:** As a user, I want the application to be named and branded as "ORGs: Organizational Reports Gathering System", so that the product identity reflects its document-gathering purpose.

#### Acceptance Criteria

1. THE ORGs SHALL display "ORGs: Organizational Reports Gathering System" as the application title in the window title bar, splash screen, and all primary navigation headers.
2. THE ORGs SHALL replace all references to "CASI 360" and "Care and Support Initiative 360" with "ORGs" or "Organizational Reports Gathering System" throughout the UI.
3. THE ORGs SHALL preserve the existing visual design system (color palette, typography, layout structure, and component library) during the rebrand.


### Requirement 2: Storage Configuration

**User Story:** As a user, I want to configure a primary local folder and an optional sync folder for backup, so that my files are organized locally and automatically backed up via my existing cloud sync client.

#### Acceptance Criteria

1. THE Document_Manager SHALL allow the user to select a Primary_Folder path on the local file system as the main storage destination.
2. THE Document_Manager SHALL allow the user to optionally configure a Sync_Folder path (e.g. `~/Google Drive/ORGs Backup`) as the backup destination.
3. THE Document_Manager SHALL write backup copies of files to the Sync_Folder after each upload, mirroring the Format_Folder structure.
4. THE Document_Manager SHALL clearly indicate that the Sync_Folder is managed by the user's cloud sync client (Google Drive for Desktop, OneDrive, etc.) and not by ORGs directly.
5. THE Document_Manager SHALL persist both folder path configurations across application sessions.
6. IF the Sync_Folder path does not exist or is not accessible, THEN THE Document_Manager SHALL display a warning and skip backup without blocking the primary upload.
7. THE Document_Manager SHALL allow the user to change or remove the Sync_Folder configuration at any time from Settings.

### Requirement 3: File Upload

**User Story:** As a user, I want to upload any document file into the system, so that it is stored and tracked in my chosen storage location.

#### Acceptance Criteria

1. THE Document_Manager SHALL accept file uploads via drag-and-drop onto the upload zone.
2. THE Document_Manager SHALL accept file uploads via a file picker dialog triggered by a button click.
3. THE Document_Manager SHALL support upload of all common document formats including PDF, DOCX, XLSX, PPTX, TXT, CSV, PNG, JPG, JPEG, GIF, SVG, MP4, MOV, AVI, and ZIP.
4. WHEN a file is uploaded, THE Document_Manager SHALL record the file name, file format/type, file size, upload timestamp, and resolved storage path in the File_Index.
5. IF a file with an identical name already exists in the same Format_Folder, THEN THE Document_Manager SHALL append a numeric suffix to the new file name to avoid overwriting the existing file.
6. THE Document_Manager SHALL display upload progress for each file being transferred to the Storage_Provider.


### Requirement 4: Automatic Format-Based Folder Organization

**User Story:** As a user, I want uploaded files to be automatically sorted into subfolders by file type, so that my storage directory stays organized without manual effort.

#### Acceptance Criteria

1. WHEN a file is uploaded, THE Document_Manager SHALL place the file inside a Format_Folder named after the file's extension in uppercase (e.g., `PDF/`, `DOCX/`, `MP4/`, `PNG/`).
2. WHEN a Format_Folder for a given file type does not yet exist in the storage root, THE Document_Manager SHALL create it before placing the file.
3. THE Document_Manager SHALL create Format_Folders inside the configured storage root for both Local and Cloud Storage_Providers.
4. THE Document_Manager SHALL NOT alter the internal structure of Format_Folders after creation.

### Requirement 5: Global File Search

**User Story:** As a user, I want to search for any uploaded file by name, type, or date from a single search bar, so that I can locate any document instantly without browsing folders.

#### Acceptance Criteria

1. THE Search_Engine SHALL provide a single global search bar accessible from the main navigation header on all pages.
2. WHEN a search query is entered, THE Search_Engine SHALL return matching results from the File_Index within 500ms for indexes containing up to 10,000 files.
3. THE Search_Engine SHALL match files by file name, file format/type, and upload date.
4. THE Search_Engine SHALL support partial and case-insensitive matching for file name queries.
5. WHEN search results are displayed, THE Search_Engine SHALL show each result's file name, format/type, upload date, and storage location.
6. WHEN a search result is selected, THE File_Viewer SHALL open the corresponding file.
7. IF no results match the query, THEN THE Search_Engine SHALL display a "No files found" message.

### Requirement 6: One-Click File Access

**User Story:** As a user, I want to open any file with a single click from the file list or search results, so that I can access my documents without navigating through folder structures.

#### Acceptance Criteria

1. THE File_Viewer SHALL open a file when the user clicks its entry in the file list, search results, or calendar upload history.
2. WHEN a Local file is opened, THE File_Viewer SHALL open the file using the operating system's default application for that file type via the Electron_Shell.
3. WHEN a Cloud file is opened, THE File_Viewer SHALL open the file in the cloud provider's native viewer in a new in-app browser window within the Electron_Shell.
4. THE File_Viewer SHALL display a loading indicator while the file is being retrieved.
5. IF a file cannot be opened, THEN THE File_Viewer SHALL display a descriptive error message indicating the reason.


### Requirement 7: Calendar Upload History View

**User Story:** As a user, I want to navigate a calendar and see which files were uploaded on any given date and time, so that I can track my document history chronologically.

#### Acceptance Criteria

1. THE Calendar_View SHALL display a monthly calendar grid with visual highlights on dates that have at least one uploaded file.
2. WHEN a highlighted date is selected, THE Calendar_View SHALL display a list of all files uploaded on that date, ordered by upload time ascending.
3. WHEN a file entry in the Calendar_View date list is clicked, THE File_Viewer SHALL open that file.
4. THE Calendar_View SHALL display the upload time alongside each file entry in the date detail list.
5. THE Calendar_View SHALL allow the user to navigate between months using previous and next controls.
6. WHILE no files have been uploaded on a given date, THE Calendar_View SHALL display that date without a highlight indicator.

### Requirement 8: Preserved Productivity Tools

**User Story:** As a user, I want all existing editing and productivity tools to remain fully functional after the rebrand and restructure, so that I do not lose any capabilities I currently rely on.

#### Acceptance Criteria

1. THE Word_Editor SHALL retain all existing rich-text editing capabilities including bold, italic, underline, headings, text alignment, bullet lists, numbered lists, undo/redo, and save to storage.
2. THE Sheet_Editor SHALL retain all existing spreadsheet capabilities including cell editing, formula support (SUM, AVERAGE, COUNT, MIN, MAX), auto-calculation, and save to storage.
3. THE Design_Editor SHALL retain all existing canvas capabilities including freehand drawing, color picker, brush size adjustment, canvas clear, notes section, and save to storage.
4. THE Video_Player SHALL retain all existing video playback capabilities for uploaded video files.
5. THE ORGs SHALL retain the existing Events Calendar with event creation, date filtering, and upcoming events list.
6. THE ORGs SHALL retain the existing Messaging system with real-time messaging, file sharing, and online status indicators.

### Requirement 9: Cloud Backup Reminder System

**User Story:** As a user, I want to receive weekend reminders to check that my sync folder is up to date, so that I prevent accidental data loss if my local device fails.

#### Acceptance Criteria

1. THE Backup_Reminder_System SHALL track the last time files were copied to the Sync_Folder.
2. WHEN files have not been copied to the Sync_Folder for 7 or more days, THE Backup_Reminder_System SHALL display a persistent in-app alert on Saturday or Sunday.
3. THE alert SHALL remain visible until dismissed by the user.
4. WHEN the user clicks "Back up now" in the alert, THE Document_Manager SHALL copy all files not yet present in the Sync_Folder.
5. THE Backup_Reminder_System SHALL update the last backup timestamp after a successful copy operation.
6. THE Backup_Reminder_System SHALL allow the user to disable weekend reminders via a settings toggle.

### Requirement 10: First-Run Setup

**User Story:** As a new user, I want to be guided to select my primary storage folder on first launch, so that the app is ready to use immediately without any account or login.

#### Acceptance Criteria

1. WHEN the app is launched for the first time and no Primary_Folder is configured, THE ORGs SHALL display a setup screen prompting the user to select a folder.
2. THE setup screen SHALL allow the user to optionally configure a Sync_Folder for backup at the same time.
3. AFTER the user selects a Primary_Folder, THE ORGs SHALL proceed directly to the main app without any login step.
4. THE ORGs SHALL NOT require any account, login, or authentication to use the app or access files.

### Requirement 11: Sync Folder Restoration

**User Story:** As a user, I want to restore my files from the sync folder on a new device, so that I can get back to work quickly without manual reorganization.

#### Acceptance Criteria

1. THE Document_Manager SHALL provide a "Restore from Sync Folder" option in Settings.
2. WHEN the user selects a Sync_Folder path and triggers restoration, THE Document_Manager SHALL copy all files from the Sync_Folder into the Primary_Folder, recreating the Format_Folder structure.
3. THE Document_Manager SHALL rebuild the File_Index from the restored files.
4. THE Document_Manager SHALL display a progress indicator during restoration.
5. IF a file cannot be copied during restoration, THE Document_Manager SHALL log the error and mark the file as "restoration failed" in the File_Index.

### Requirement 12: File Index Integrity

**User Story:** As a user, I want the file index to accurately reflect all uploaded files at all times, so that search and calendar results are always correct and up to date.

#### Acceptance Criteria

1. THE File_Index SHALL be updated atomically upon successful completion of each file upload to the Storage_Provider.
2. WHEN a file is deleted from the system, THE File_Index SHALL remove the corresponding entry within the same operation.
3. THE File_Index SHALL persist across application restarts without data loss.
4. FOR ALL files recorded in the File_Index, the File_Index entry SHALL contain a resolvable storage path that points to the actual file location in the Storage_Provider.
5. IF a file recorded in the File_Index cannot be located at its stored path, THEN THE Document_Manager SHALL mark that entry as "missing" and display a visual indicator in the file list and search results.

### Requirement 13: Electron Desktop Application Packaging

**User Story:** As a user, I want to install ORGs as a native desktop application on my PC, so that I can use it like any other installed program without needing a browser.

#### Acceptance Criteria

1. THE Electron_Shell SHALL package the React application as an installable desktop application for Windows, macOS, and Linux.
2. THE Electron_Shell SHALL produce a platform-native installer (e.g., `.exe` NSIS installer for Windows, `.dmg` for macOS, `.AppImage` or `.deb` for Linux).
3. WHEN the application is launched, THE Electron_Shell SHALL display the ORGs UI in a Chromium-based window without browser navigation chrome (no address bar, no browser tabs).
4. THE Electron_Shell SHALL grant the application access to the local file system for reading and writing files to the configured Local storage directory.
5. THE Electron_Shell SHALL support OAuth redirect flows for Google Drive and Microsoft OneDrive authentication within the application window.
6. THE Electron_Shell SHALL persist application window size and position across sessions.
7. WHEN a new version of the application is available, THE Electron_Shell SHALL notify the user and provide an option to download and install the update.
8. THE Electron_Shell SHALL register the application in the operating system's installed programs list, enabling standard uninstallation.

### Requirement 14: File Management Operations

**User Story:** As a user, I want to rename, move, and delete files from within the app, so that I can maintain my document library without switching to a file explorer.

#### Acceptance Criteria

1. THE Document_Manager SHALL allow the user to rename a file from within the file list view.
2. WHEN a file is renamed, THE Document_Manager SHALL update the file name in both the Storage_Provider and the File_Index.
3. THE Document_Manager SHALL allow the user to delete a file from within the file list view, with a confirmation prompt before deletion.
4. WHEN a file is deleted, THE Document_Manager SHALL remove the file from the Storage_Provider and remove its entry from the File_Index.
5. THE Document_Manager SHALL allow the user to move a file to a different Format_Folder within the same Storage_Provider.
6. WHEN a file is moved, THE Document_Manager SHALL update the storage path in the File_Index to reflect the new location.
