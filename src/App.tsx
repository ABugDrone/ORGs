import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { SearchProvider } from '@/context/SearchContext';
import { MessagesProvider } from '@/context/MessagesContext';
import AppLayout from '@/components/layout/AppLayout';
import Dashboard from '@/pages/Dashboard';
import FileManagementPage from '@/pages/FileManagementPage';
import SearchPage from '@/pages/SearchPage';
import MessagesPage from '@/pages/MessagesPage';
import EventsPage from '@/pages/EventsPage';
import SettingsPage from '@/pages/SettingsPage';
import NotFound from './pages/NotFound';
import FirstRunSetup from '@/components/setup/FirstRunSetup';
import BackupReminderBanner from '@/components/backup/BackupReminderBanner';
import { fileIndexService } from '@/lib/fileIndex/fileIndexService';
import { checkAndNotify } from '@/lib/backup/backupReminderSystem';
import { fileExists, setAllowedDirs } from '@/lib/electron/electronBridge';

const queryClient = new QueryClient();

function isSetupComplete(): boolean {
  return (
    localStorage.getItem('orgs_setup_complete') === 'true' ||
    !!localStorage.getItem('orgs_primary_folder')
  );
}

/** Map file extension to an accurate MIME type. */
function getMimeTypeFromExtension(ext: string, fallbackType?: string): string {
  const map: Record<string, string> = {
    PDF: 'application/pdf',
    DOCX: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    DOC: 'application/msword',
    XLSX: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    XLS: 'application/vnd.ms-excel',
    PPTX: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    PPT: 'application/vnd.ms-powerpoint',
    TXT: 'text/plain',
    CSV: 'text/csv',
    PNG: 'image/png',
    JPG: 'image/jpeg',
    JPEG: 'image/jpeg',
    GIF: 'image/gif',
    WEBP: 'image/webp',
    SVG: 'image/svg+xml',
    MP4: 'video/mp4',
    MOV: 'video/quicktime',
    AVI: 'video/x-msvideo',
    MKV: 'video/x-matroska',
    MP3: 'audio/mpeg',
    WAV: 'audio/wav',
    ZIP: 'application/zip',
    RAR: 'application/x-rar-compressed',
    '7Z': 'application/x-7z-compressed',
  };
  return map[ext.toUpperCase()] ?? (fallbackType === 'video' ? 'video/mp4' : 'application/octet-stream');
}

function AppRoutes() {
  const [setupDone, setSetupDone] = useState(isSetupComplete);
  const [showReminder, setShowReminder] = useState(false);

  // Init file index + scan for missing files + sync from storageService
  useEffect(() => {
    fileIndexService.init().then(async () => {
      // Notify main process of allowed directories for path validation
      const primaryFolder = localStorage.getItem('orgs_primary_folder');
      const syncFolder = localStorage.getItem('orgs_sync_folder');
      const allowedDirs = [primaryFolder, syncFolder].filter(Boolean) as string[];
      if (allowedDirs.length > 0) {
        setAllowedDirs(allowedDirs).catch(() => {});
      }
      // Sync existing files from storageService into fileIndexService if index is empty
      if (fileIndexService.getAll().length === 0) {
        const { storageService } = await import('@/lib/storage/storageService');
        const existingFiles = storageService.getFiles();
        for (const f of existingFiles) {
          const ext = (f.format || f.name.split('.').pop()?.toUpperCase() || 'FILE').toUpperCase();
          // Determine MIME type accurately from file extension
          const mimeType = getMimeTypeFromExtension(ext, f.type);
          await fileIndexService.add({
            name: f.name,
            extension: ext,
            mimeType,
            sizeBytes: f.size || 0,
            localPath: null,
            url: f.url || '',
            storageStatus: 'local',
          });
        }
      }
      fileIndexService.scanMissingFiles(fileExists);
    });
  }, []);

  // Hourly backup reminder check
  useEffect(() => {
    const run = () => checkAndNotify(() => setShowReminder(true));
    run();
    const id = setInterval(run, 60 * 60 * 1000);
    return () => clearInterval(id);
  }, []);

  if (!setupDone) {
    return <FirstRunSetup onComplete={() => setSetupDone(true)} />;
  }

  return (
    <>
      <AnimatePresence>
        {showReminder && (
          <BackupReminderBanner onDismiss={() => setShowReminder(false)} />
        )}
      </AnimatePresence>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/files" element={<FileManagementPage />} />
            <Route path="/upload" element={<FileManagementPage />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <SearchProvider>
      <MessagesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <AppRoutes />
        </TooltipProvider>
      </MessagesProvider>
    </SearchProvider>
  </QueryClientProvider>
);

export default App;
