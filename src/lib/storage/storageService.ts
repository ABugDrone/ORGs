// StorageService - Centralized localStorage management for Enhanced Dashboard
export type ContentType = 'document' | 'spreadsheet' | 'design' | 'file';

export interface WorkEntry {
  id: string;
  name: string;
  fileId: string;
  format: string;
  date: string;
  size: string;
  content?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Document {
  id: string;
  title: string;
  content: string;
  contentJson: object;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface CellData {
  value: string;
  formula: string | null;
  computed: string | number | null;
  format?: {
    bold?: boolean;
    italic?: boolean;
    align?: 'left' | 'center' | 'right';
    backgroundColor?: string;
  };
}

export interface Spreadsheet {
  id: string;
  title: string;
  cells: Record<string, CellData>;
  rows: number;
  cols: number;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface Design {
  id: string;
  title: string;
  mode: 'canvas' | 'notes';
  canvasData: string | null;
  notesContent: string | null;
  createdAt: string;
  updatedAt: string;
  author: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  type: 'video' | 'document' | 'image' | 'google-drive-link';
  format: string;
  size: number;
  sizeFormatted: string;
  url: string;
  thumbnail?: string;
  uploadDate: string;
  uploadTimestamp: string;
  metadata?: {
    duration?: number;
    width?: number;
    height?: number;
    pageCount?: number;
    author?: string;
  };
}

export interface DateFilesIndex {
  [date: string]: string[];
}

class StorageService {
  private readonly KEYS = {
    WORK_ENTRIES: 'casi360_work_entries',
    DOCUMENTS: 'casi360_documents',
    SPREADSHEETS: 'casi360_spreadsheets',
    DESIGNS: 'casi360_designs',
    FILES: 'casi360_files',
    DATE_FILES_INDEX: 'casi360_date_files_index',
  };

  // Work Entries
  getWorkEntries(): WorkEntry[] {
    return this.getItem<WorkEntry[]>(this.KEYS.WORK_ENTRIES, []);
  }

  addWorkEntry(entry: Omit<WorkEntry, 'id' | 'createdAt' | 'updatedAt'>): WorkEntry {
    const entries = this.getWorkEntries();
    const newEntry: WorkEntry = {
      ...entry,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    entries.push(newEntry);
    this.setItem(this.KEYS.WORK_ENTRIES, entries);
    return newEntry;
  }

  updateWorkEntry(entry: WorkEntry): void {
    const entries = this.getWorkEntries();
    const index = entries.findIndex(e => e.id === entry.id);
    if (index !== -1) {
      entries[index] = { ...entry, updatedAt: new Date().toISOString() };
      this.setItem(this.KEYS.WORK_ENTRIES, entries);
    }
  }

  deleteWorkEntry(id: string): void {
    const entries = this.getWorkEntries();
    const filtered = entries.filter(e => e.id !== id);
    this.setItem(this.KEYS.WORK_ENTRIES, filtered);
  }

  // Documents
  getDocuments(): Document[] {
    return this.getItem<Document[]>(this.KEYS.DOCUMENTS, []);
  }

  getDocument(id: string): Document | null {
    const docs = this.getDocuments();
    return docs.find(d => d.id === id) || null;
  }

  saveDocument(doc: Omit<Document, 'id' | 'createdAt' | 'updatedAt'>): Document {
    const docs = this.getDocuments();
    const newDoc: Document = {
      ...doc,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    docs.push(newDoc);
    this.setItem(this.KEYS.DOCUMENTS, docs);
    return newDoc;
  }

  updateDocument(doc: Document): void {
    const docs = this.getDocuments();
    const index = docs.findIndex(d => d.id === doc.id);
    if (index !== -1) {
      docs[index] = { ...doc, updatedAt: new Date().toISOString() };
      this.setItem(this.KEYS.DOCUMENTS, docs);
    }
  }

  // Spreadsheets
  getSpreadsheets(): Spreadsheet[] {
    return this.getItem<Spreadsheet[]>(this.KEYS.SPREADSHEETS, []);
  }

  getSpreadsheet(id: string): Spreadsheet | null {
    const sheets = this.getSpreadsheets();
    return sheets.find(s => s.id === id) || null;
  }

  saveSpreadsheet(sheet: Omit<Spreadsheet, 'id' | 'createdAt' | 'updatedAt'>): Spreadsheet {
    const sheets = this.getSpreadsheets();
    const newSheet: Spreadsheet = {
      ...sheet,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    sheets.push(newSheet);
    this.setItem(this.KEYS.SPREADSHEETS, sheets);
    return newSheet;
  }

  updateSpreadsheet(sheet: Spreadsheet): void {
    const sheets = this.getSpreadsheets();
    const index = sheets.findIndex(s => s.id === sheet.id);
    if (index !== -1) {
      sheets[index] = { ...sheet, updatedAt: new Date().toISOString() };
      this.setItem(this.KEYS.SPREADSHEETS, sheets);
    }
  }

  // Designs
  getDesigns(): Design[] {
    return this.getItem<Design[]>(this.KEYS.DESIGNS, []);
  }

  getDesign(id: string): Design | null {
    const designs = this.getDesigns();
    return designs.find(d => d.id === id) || null;
  }

  saveDesign(design: Omit<Design, 'id' | 'createdAt' | 'updatedAt'>): Design {
    const designs = this.getDesigns();
    const newDesign: Design = {
      ...design,
      id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    designs.push(newDesign);
    this.setItem(this.KEYS.DESIGNS, designs);
    return newDesign;
  }

  updateDesign(design: Design): void {
    const designs = this.getDesigns();
    const index = designs.findIndex(d => d.id === design.id);
    if (index !== -1) {
      designs[index] = { ...design, updatedAt: new Date().toISOString() };
      this.setItem(this.KEYS.DESIGNS, designs);
    }
  }

  // Files
  getFiles(): FileMetadata[] {
    return this.getItem<FileMetadata[]>(this.KEYS.FILES, []);
  }

  getFilesByDate(date: string): FileMetadata[] {
    const index = this.getDateFilesIndex();
    const fileIds = index[date] || [];
    const allFiles = this.getFiles();
    return allFiles.filter(f => fileIds.includes(f.id));
  }

  saveFile(file: Omit<FileMetadata, 'id' | 'uploadTimestamp'>): FileMetadata {
    const files = this.getFiles();
    const newFile: FileMetadata = {
      ...file,
      id: this.generateId(),
      uploadTimestamp: new Date().toISOString(),
    };
    files.push(newFile);
    this.setItem(this.KEYS.FILES, files);
    
    // Update date index
    this.addFileToDateIndex(newFile.uploadDate, newFile.id);
    
    return newFile;
  }

  saveGoogleDriveLink(url: string, date: string): FileMetadata {
    return this.saveFile({
      name: 'Google Drive Video',
      type: 'google-drive-link',
      format: 'Google Drive',
      size: 0,
      sizeFormatted: 'N/A',
      url,
      uploadDate: date,
    });
  }

  // Date Files Index
  private getDateFilesIndex(): DateFilesIndex {
    return this.getItem<DateFilesIndex>(this.KEYS.DATE_FILES_INDEX, {});
  }

  private addFileToDateIndex(date: string, fileId: string): void {
    const index = this.getDateFilesIndex();
    if (!index[date]) {
      index[date] = [];
    }
    index[date].push(fileId);
    this.setItem(this.KEYS.DATE_FILES_INDEX, index);
  }

  // Utility methods
  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error(`Error reading from localStorage (${key}):`, error);
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error writing to localStorage (${key}):`, error);
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage full. Please delete some files to free up space.');
      }
      throw new Error('Failed to save data. Please try again.');
    }
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const storageService = new StorageService();
