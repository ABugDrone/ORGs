import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { FileIndexEntry } from './types';

interface ORGsDB extends DBSchema {
  files: {
    key: string;
    value: FileIndexEntry;
    indexes: {
      'by-date': string;
      'by-category': string;
      'by-extension': string;
    };
  };
}

const DB_NAME = 'orgs-file-index';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<ORGsDB>> | null = null;

export function getDb(): Promise<IDBPDatabase<ORGsDB>> {
  if (!dbPromise) {
    dbPromise = openDB<ORGsDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('files', { keyPath: 'id' });
        store.createIndex('by-date', 'uploadDate');
        store.createIndex('by-category', 'category');
        store.createIndex('by-extension', 'extension');
      },
    });
  }
  return dbPromise;
}

export async function dbGetAll(): Promise<FileIndexEntry[]> {
  const db = await getDb();
  return db.getAll('files');
}

export async function dbGet(id: string): Promise<FileIndexEntry | undefined> {
  const db = await getDb();
  return db.get('files', id);
}

export async function dbPut(entry: FileIndexEntry): Promise<void> {
  const db = await getDb();
  await db.put('files', entry);
}

export async function dbDelete(id: string): Promise<void> {
  const db = await getDb();
  await db.delete('files', id);
}

export async function dbGetByDate(date: string): Promise<FileIndexEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex('files', 'by-date', date);
}

export async function dbGetByCategory(category: string): Promise<FileIndexEntry[]> {
  const db = await getDb();
  return db.getAllFromIndex('files', 'by-category', category);
}

export async function dbClear(): Promise<void> {
  const db = await getDb();
  await db.clear('files');
}
