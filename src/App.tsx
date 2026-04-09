import { useEffect, useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
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
import { fileExists } from '@/lib/electron/electronBridge';

const queryClient = new QueryClient();

function isSetupComplete(): boolean {
  return (
    localStorage.getItem('orgs_setup_complete') === 'true' ||
    !!localStorage.getItem('orgs_primary_folder')
  );
}

function AppRoutes() {
  const [setupDone, setSetupDone] = useState(isSetupComplete);
  const [showReminder, setShowReminder] = useState(false);

  // Init file index + scan for missing files + sync from storageService
  useEffect(() => {
    fileIndexService.init().then(async () => {
      // Sync existing files from storageService into fileIndexService if index is empty
      if (fileIndexService.getAll().length === 0) {
        const { storageService } = await import('@/lib/storage/storageService');
        const existingFiles = storageService.getFiles();
        for (const f of existingFiles) {
          const ext = f.format || (f.name.split('.').pop()?.toUpperCase() ?? 'FILE');
          await fileIndexService.add({
            name: f.name,
            extension: ext,
            mimeType: f.type === 'video' ? 'video/mp4' : 'application/octet-stream',
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
      {showReminder && (
        <BackupReminderBanner onDismiss={() => setShowReminder(false)} />
      )}
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
