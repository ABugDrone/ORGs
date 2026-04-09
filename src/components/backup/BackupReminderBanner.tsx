import React, { useState } from 'react';
import { Cloud, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerBackupNow, getLastBackupDate } from '@/lib/backup/backupReminderSystem';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

interface Props {
  onDismiss: () => void;
}

const BackupReminderBanner: React.FC<Props> = ({ onDismiss }) => {
  const [loading, setLoading] = useState(false);
  const last = getLastBackupDate();

  const handleBackup = async () => {
    setLoading(true);
    try {
      const count = await triggerBackupNow();
      if (count > 0) {
        toast.success(`${count} file${count > 1 ? 's' : ''} backed up to sync folder.`);
      } else {
        toast.info('All files are already backed up.');
      }
      onDismiss();
    } catch {
      toast.error('Backup failed. Check your sync folder in Settings.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      className="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3 shadow-md"
    >
      <Cloud className="h-5 w-5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          Weekend backup reminder — your files haven't been backed up
          {last ? ` since ${last.toLocaleDateString()}` : ' yet'}.
        </p>
      </div>
      <Button
        size="sm"
        variant="secondary"
        onClick={handleBackup}
        disabled={loading}
        className="shrink-0 gap-2"
      >
        {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Cloud className="h-3.5 w-3.5" />}
        Back up now
      </Button>
      <Button size="icon" variant="ghost" className="shrink-0 h-7 w-7 hover:bg-primary-foreground/20" onClick={onDismiss}>
        <X className="h-4 w-4" />
      </Button>
    </motion.div>
  );
};

export default BackupReminderBanner;
