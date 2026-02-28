# ORGs - Organizational Report Gathering System

ORGs is a comprehensive organizational report gathering and file management system designed for internal department management, collaboration, and document organization. The application provides a unified dashboard for managing reports, files, and departmental workflows with advanced file management capabilities and cross-platform desktop support.

## Features

- **Report Management**: Create, edit, and track organizational reports with approval workflows
- **File Management System**: Organize files by folders and formats with direct path access
- **Department Management**: Hierarchical department and subdepartment organization
- **Advanced Search**: Full-text search across reports and documents with AI-powered summaries
- **Real-time Messaging**: Internal communication system with unread notifications
- **Attendance Tracking**: Employee attendance and overtime management
- **Calendar & Events**: Organizational event planning and scheduling
- **Desktop Application**: Installable desktop version with native file system integration
- **Direct File Access**: Open files directly using file paths without multiple clicks

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Framework**: shadcn-ui, Tailwind CSS
- **State Management**: React Context, TanStack Query
- **Desktop**: Electron (for desktop application)
- **Routing**: React Router
- **Forms**: React Hook Form, Zod validation
- **Rich Text**: TipTap editor

## Project info

**URL**: https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Building the Desktop Application

ORGs can be packaged as a desktop application using Electron for Windows, macOS, and Linux.

### Prerequisites

- Node.js 18+ and npm
- Platform-specific build tools (see Electron documentation)

### Build Instructions

```sh
# Install dependencies including Electron
npm install

# Build the web application
npm run build

# Package for your current platform
npm run electron:build

# Package for specific platforms
npm run electron:build:win    # Windows
npm run electron:build:mac    # macOS
npm run electron:build:linux  # Linux
```

### Desktop Application Features

- **Native File System Access**: Browse and manage files on your local computer
- **Offline Mode**: Access cached data without internet connection
- **System Integration**: Taskbar/dock integration, system tray support
- **Auto-updates**: Automatic updates when new versions are released
- **Direct File Opening**: Open files with default system applications

### Installation

After building, installers will be available in the `dist` directory:
- Windows: `.exe` installer
- macOS: `.dmg` disk image
- Linux: `.AppImage` or `.deb` package

## File Management System

ORGs includes a powerful file management system that allows you to:

- **Organize by Folders**: Create hierarchical folder structures for your documents
- **Filter by Format**: Quickly find files by type (PDF, DOCX, XLSX, images, etc.)
- **Direct Path Access**: Open files directly by entering their path (e.g., `/reports/2024/Q1/summary.pdf`)
- **Drag & Drop**: Upload files by dragging them into the application
- **Path Autocomplete**: Get suggestions as you type file paths
- **Recent Files**: Access recently opened files and folders

### Using Direct File Access

1. Click the "Go to Path" button or press `Ctrl+P` (Windows/Linux) or `Cmd+P` (macOS)
2. Enter the file path (e.g., `/documents/contracts/2024/agreement.pdf`)
3. Press Enter to open the file directly

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Electron (for desktop application)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
