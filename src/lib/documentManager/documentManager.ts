import { fileIndexService } from '@/lib/fileIndex/fileIndexService';
import { FileIndexEntry, getCategory, formatBytes } from '@/lib/fileIndex/types';
import {
  ensureDir, writeFile, deleteFile as fsDeleteFile,
  renameFile as fsRenameFile, copyFile, fileExists,
  isElectron,
} from '@/lib/electron/electronBridge';

// ── Config ────────────────────────────────────────────────────────────────────

export interface StorageConfig {
  primaryFolder: string | null;
  syncFolder: string | null;
}

export function getStorageConfig(): StorageConfig {
  return {
    primaryFolder: localStorage.getItem('orgs_primary_folder'),
    syncFolder: localStorage.getItem('orgs_sync_folder'),
  };
}

// ── Format folder helpers ─────────────────────────────────────────────────────

export function resolveFormatFolder(rootPath: string, extension: string): string {
  // Use path.join equivalent — works cross-platform via simple string join
  const sep = rootPath.includes('/') ? '/' : '\\';
  return `${rootPath}${sep}${extension.toUpperCase()}`;
}

export async function ensureFormatFolder(rootPath: string, extension: string): Promise<string> {
  const folder = resolveFormatFolder(rootPath, extension);
  await ensureDir(folder);
  return folder;
}

// ── Unique filename ───────────────────────────────────────────────────────────

export async function resolveUniqueFileName(
  folderPath: string,
  fileName: string
): Promise<string> {
  const sep = folderPath.includes('/') ? '/' : '\\';
  const lastDot = fileName.lastIndexOf('.');
  const name = lastDot > 0 ? fileName.slice(0, lastDot) : fileName;
  const ext = lastDot > 0 ? fileName.slice(lastDot) : '';

  let candidate = fileName;
  let counter = 1;
  while (await fileExists(`${folderPath}${sep}${candidate}`)) {
    candidate = `${name} (${counter})${ext}`;
    counter++;
  }
  return candidate;
}

// ── Upload pipeline ───────────────────────────────────────────────────────────

export interface UploadResult {
  entry: FileIndexEntry;
  localPath: string;
}

export async function uploadFile(
  file: File,
  config?: StorageConfig
): Promise<UploadResult> {
  const cfg = config ?? getStorageConfig();

  const ext = (file.name.split('.').pop() ?? 'bin').toUpperCase();
  const objectUrl = URL.createObjectURL(file);

  // Browser-only mode (no Electron / no primary folder)
  if (!isElectron() || !cfg.primaryFolder) {
    const entry = await fileIndexService.add({
      name: file.name,
      extension: ext,
      mimeType: file.type,
      sizeBytes: file.size,
      localPath: null,
      url: objectUrl,
      storageStatus: 'local',
    });
    return { entry, localPath: '' };
  }

  // Electron mode — write to disk
  const folderPath = await ensureFormatFolder(cfg.primaryFolder, ext);
  const uniqueName = await resolveUniqueFileName(folderPath, file.name);
  const sep = folderPath.includes('/') ? '/' : '\\';
  const localPath = `${folderPath}${sep}${uniqueName}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(localPath, buffer);

  const entry = await fileIndexService.add({
    name: uniqueName,
    extension: ext,
    mimeType: file.type,
    sizeBytes: file.size,
    localPath,
    url: objectUrl,
    storageStatus: cfg.syncFolder ? 'local' : 'local',
  });

  // Sync folder backup (fire-and-forget)
  if (cfg.syncFolder) {
    syncToBackup(localPath, cfg.syncFolder, ext, uniqueName, entry.id).catch(console.warn);
  }

  return { entry, localPath };
}

// ── Sync folder backup ────────────────────────────────────────────────────────

async function syncToBackup(
  localPath: string,
  syncFolder: string,
  ext: string,
  fileName: string,
  entryId: string
): Promise<void> {
  try {
    const destFolder = resolveFormatFolder(syncFolder, ext);
    await ensureDir(destFolder);
    const sep = destFolder.includes('/') ? '/' : '\\';
    const destPath = `${destFolder}${sep}${fileName}`;
    await copyFile(localPath, destPath);
    await fileIndexService.update(entryId, {
      storageStatus: 'synced',
    });
    localStorage.setItem('orgs_last_backup', new Date().toISOString());
  } catch (err) {
    console.warn('Sync backup failed:', err);
  }
}

export async function backupAllPending(config?: StorageConfig): Promise<number> {
  const cfg = config ?? getStorageConfig();
  if (!cfg.syncFolder) return 0;

  const pending = fileIndexService.getAll().filter(
    e => e.storageStatus === 'local' && e.localPath
  );

  let count = 0;
  for (const entry of pending) {
    try {
      await syncToBackup(entry.localPath!, cfg.syncFolder, entry.extension, entry.name, entry.id);
      count++;
    } catch { /* continue */ }
  }
  return count;
}

// ── File operations ───────────────────────────────────────────────────────────

export async function renameFile(id: string, newName: string): Promise<FileIndexEntry | null> {
  const entry = fileIndexService.getById(id);
  if (!entry) return null;

  if (entry.localPath) {
    const sep = entry.localPath.includes('/') ? '/' : '\\';
    const dir = entry.localPath.substring(0, entry.localPath.lastIndexOf(sep));
    const newPath = `${dir}${sep}${newName}`;
    await fsRenameFile(entry.localPath, newPath);
    return fileIndexService.update(id, { name: newName, localPath: newPath });
  }
  return fileIndexService.update(id, { name: newName });
}

export async function deleteFileEntry(id: string): Promise<void> {
  const entry = fileIndexService.getById(id);
  if (!entry) return;
  if (entry.localPath) {
    await fsDeleteFile(entry.localPath).catch(console.warn);
  }
  await fileIndexService.remove(id);
}

export async function moveFile(
  id: string,
  targetExtension: string,
  config?: StorageConfig
): Promise<FileIndexEntry | null> {
  const entry = fileIndexService.getById(id);
  if (!entry || !entry.localPath) return null;

  const cfg = config ?? getStorageConfig();
  if (!cfg.primaryFolder) return null;

  const newFolder = await ensureFormatFolder(cfg.primaryFolder, targetExtension);
  const sep = newFolder.includes('/') ? '/' : '\\';
  const newPath = `${newFolder}${sep}${entry.name}`;

  await fsRenameFile(entry.localPath, newPath);
  return fileIndexService.update(id, {
    localPath: newPath,
    extension: targetExtension.toUpperCase(),
    category: getCategory(targetExtension),
  });
}

// ── Restore from sync folder ──────────────────────────────────────────────────

export interface RestoreResult {
  restored: number;
  failed: number;
}

export async function restoreFromSyncFolder(
  syncFolder: string,
  primaryFolder: string,
  onProgress?: (pct: number) => void
): Promise<RestoreResult> {
  const { readDir } = await import('@/lib/electron/electronBridge');
  let restored = 0;
  let failed = 0;

  // List top-level format folders in sync folder
  const topDirs = await readDir(syncFolder);
  const formatDirs = topDirs.filter(d => d.isDirectory);
  const total = formatDirs.length;

  for (let i = 0; i < formatDirs.length; i++) {
    const formatDir = formatDirs[i];
    const sep = syncFolder.includes('/') ? '/' : '\\';
    const srcFolder = `${syncFolder}${sep}${formatDir.name}`;
    const files = await readDir(srcFolder);

    for (const f of files.filter(x => !x.isDirectory)) {
      try {
        const destFolder = resolveFormatFolder(primaryFolder, formatDir.name);
        await ensureDir(destFolder);
        const destSep = destFolder.includes('/') ? '/' : '\\';
        const destPath = `${destFolder}${destSep}${f.name}`;
        await copyFile(`${srcFolder}${sep}${f.name}`, destPath);

        const ext = (f.name.split('.').pop() ?? 'bin').toUpperCase();
        await fileIndexService.add({
          name: f.name,
          extension: ext,
          mimeType: '',
          sizeBytes: 0,
          localPath: destPath,
          url: '',
          storageStatus: 'synced',
        });
        restored++;
      } catch {
        failed++;
      }
    }
    onProgress?.(Math.round(((i + 1) / total) * 100));
  }

  return { restored, failed };
}
