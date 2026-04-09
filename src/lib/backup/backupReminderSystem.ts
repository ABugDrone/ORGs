import { backupAllPending } from '@/lib/documentManager/documentManager';
import { showNotification } from '@/lib/electron/electronBridge';

const LAST_BACKUP_KEY = 'orgs_last_backup';
const REMINDERS_KEY = 'orgs_reminders_enabled';
const STALE_DAYS = 7;

export function getLastBackupDate(): Date | null {
  const raw = localStorage.getItem(LAST_BACKUP_KEY);
  return raw ? new Date(raw) : null;
}

export function isBackupStale(): boolean {
  const last = getLastBackupDate();
  if (!last) return true;
  const diffMs = Date.now() - last.getTime();
  return diffMs > STALE_DAYS * 24 * 60 * 60 * 1000;
}

export function isRemindersEnabled(): boolean {
  return localStorage.getItem(REMINDERS_KEY) !== 'false';
}

export function isWeekend(): boolean {
  const day = new Date().getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function shouldShowReminder(): boolean {
  return isRemindersEnabled() && isWeekend() && isBackupStale();
}

export async function triggerBackupNow(): Promise<number> {
  const count = await backupAllPending();
  if (count > 0) {
    localStorage.setItem(LAST_BACKUP_KEY, new Date().toISOString());
    await showNotification('ORGs Backup', `${count} file${count > 1 ? 's' : ''} backed up to sync folder.`);
  }
  return count;
}

/** Call this once per hour (e.g. via setInterval in App.tsx) */
export async function checkAndNotify(
  onReminderNeeded: () => void
): Promise<void> {
  if (shouldShowReminder()) {
    onReminderNeeded();
    await showNotification(
      'ORGs — Backup Reminder',
      "It's been a while since your last backup. Open ORGs to back up your files."
    );
  }
}
