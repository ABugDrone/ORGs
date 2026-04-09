import { dbGetAll, dbPut, dbDelete, dbGetByDate, dbGetByCategory, dbClear } from './fileIndexDb';
import { FileIndexEntry, FormatCategory, getCategory, formatBytes } from './types';

/**
 * FileIndexService — async IndexedDB-backed registry with sync in-memory cache.
 * Call `init()` once on app startup to hydrate the cache.
 */
class FileIndexService {
  private cache: Map<string, FileIndexEntry> = new Map();
  private ready = false;

  // ── Bootstrap ─────────────────────────────────────────────────────────────

  async init(): Promise<void> {
    const all = await dbGetAll();
    this.cache.clear();
    all.forEach(e => this.cache.set(e.id, e));
    this.ready = true;
  }

  private ensureReady() {
    if (!this.ready) {
      // Fallback: try localStorage snapshot for SSR / test environments
      try {
        const raw = localStorage.getItem('orgs_file_index_cache');
        if (raw) {
          const entries: FileIndexEntry[] = JSON.parse(raw);
          entries.forEach(e => this.cache.set(e.id, e));
        }
      } catch { /* ignore */ }
    }
  }

  // ── CRUD ──────────────────────────────────────────────────────────────────

  async add(
    entry: Omit<FileIndexEntry, 'id' | 'uploadedAt' | 'uploadDate' | 'category' | 'sizeFormatted'>
  ): Promise<FileIndexEntry> {
    const now = new Date();
    const full: FileIndexEntry = {
      ...entry,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      uploadedAt: now.toISOString(),
      uploadDate: now.toISOString().split('T')[0],
      category: getCategory(entry.extension),
      sizeFormatted: formatBytes(entry.sizeBytes),
    };
    await dbPut(full);
    this.cache.set(full.id, full);
    this.persistCache();
    return full;
  }

  async update(id: string, patch: Partial<FileIndexEntry>): Promise<FileIndexEntry | null> {
    const existing = this.cache.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...patch };
    await dbPut(updated);
    this.cache.set(id, updated);
    this.persistCache();
    return updated;
  }

  async remove(id: string): Promise<void> {
    await dbDelete(id);
    this.cache.delete(id);
    this.persistCache();
  }

  async clear(): Promise<void> {
    await dbClear();
    this.cache.clear();
    this.persistCache();
  }

  // ── Sync reads (from cache) ───────────────────────────────────────────────

  getAll(): FileIndexEntry[] {
    this.ensureReady();
    return Array.from(this.cache.values());
  }

  getById(id: string): FileIndexEntry | null {
    this.ensureReady();
    return this.cache.get(id) ?? null;
  }

  getByDate(date: string): FileIndexEntry[] {
    this.ensureReady();
    return this.getAll()
      .filter(e => e.uploadDate === date)
      .sort((a, b) => a.uploadedAt.localeCompare(b.uploadedAt));
  }

  getByCategory(category: FormatCategory): FileIndexEntry[] {
    this.ensureReady();
    return this.getAll().filter(e => e.category === category);
  }

  getDatesWithFiles(): Set<string> {
    this.ensureReady();
    return new Set(this.getAll().map(e => e.uploadDate));
  }

  getTimelineForDate(date: string): { time: string; entry: FileIndexEntry }[] {
    return this.getByDate(date).map(e => ({
      time: new Date(e.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      entry: e,
    }));
  }

  groupByCategory(): Record<string, FileIndexEntry[]> {
    const groups: Record<string, FileIndexEntry[]> = {};
    for (const entry of this.getAll()) {
      if (!groups[entry.category]) groups[entry.category] = [];
      groups[entry.category].push(entry);
    }
    return groups;
  }

  groupByExtension(): Record<string, FileIndexEntry[]> {
    const groups: Record<string, FileIndexEntry[]> = {};
    for (const entry of this.getAll()) {
      if (!groups[entry.extension]) groups[entry.extension] = [];
      groups[entry.extension].push(entry);
    }
    return groups;
  }

  search(query: string): FileIndexEntry[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();
    return this.getAll().filter(e =>
      e.name.toLowerCase().includes(q) ||
      e.extension.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      e.uploadDate.includes(q)
    );
  }

  getStats() {
    const all = this.getAll();
    const today = new Date().toISOString().split('T')[0];
    return {
      total: all.length,
      today: all.filter(e => e.uploadDate === today).length,
      totalBytes: all.reduce((s, e) => s + e.sizeBytes, 0),
      byCategory: Object.entries(this.groupByCategory()).map(([cat, files]) => ({
        category: cat,
        count: files.length,
      })),
    };
  }

  // ── Missing file scan ─────────────────────────────────────────────────────

  async scanMissingFiles(
    checkExists: (path: string) => Promise<boolean>
  ): Promise<string[]> {
    const missing: string[] = [];
    for (const entry of this.getAll()) {
      if (entry.localPath) {
        const exists = await checkExists(entry.localPath);
        if (!exists && entry.storageStatus !== 'missing') {
          await this.update(entry.id, { storageStatus: 'missing' });
          missing.push(entry.id);
        }
      }
    }
    return missing;
  }

  // ── Cache persistence (localStorage snapshot for fast cold start) ─────────

  private persistCache() {
    try {
      localStorage.setItem(
        'orgs_file_index_cache',
        JSON.stringify(Array.from(this.cache.values()))
      );
    } catch { /* quota exceeded — ignore */ }
  }
}

export const fileIndexService = new FileIndexService();
