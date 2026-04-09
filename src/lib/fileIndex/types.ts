export type FileFormat =
  | 'PDF' | 'DOCX' | 'DOC' | 'XLSX' | 'XLS' | 'PPTX' | 'PPT'
  | 'TXT' | 'CSV' | 'PNG' | 'JPG' | 'JPEG' | 'GIF' | 'SVG' | 'WEBP'
  | 'MP4' | 'MOV' | 'AVI' | 'WEBM' | 'MKV'
  | 'ZIP' | 'RAR' | '7Z'
  | 'ORGS-DOC' | 'ORGS-SHEET' | 'ORGS-DESIGN'
  | string;

export type FormatCategory =
  | 'Documents'
  | 'Spreadsheets'
  | 'Presentations'
  | 'Images'
  | 'Videos'
  | 'Archives'
  | 'ORGs Files'
  | 'Other';

export interface FileIndexEntry {
  id: string;
  name: string;
  extension: string;          // uppercase, e.g. "PDF"
  category: FormatCategory;
  mimeType: string;
  sizeBytes: number;
  sizeFormatted: string;
  localPath: string | null;   // null = stored in localStorage (browser mode)
  url: string;                // object URL or data URL for browser mode
  uploadedAt: string;         // ISO 8601
  uploadDate: string;         // "YYYY-MM-DD" for calendar indexing
  storageStatus: 'local' | 'synced' | 'missing';
}

export const FORMAT_CATEGORIES: Record<string, FormatCategory> = {
  PDF: 'Documents', DOC: 'Documents', DOCX: 'Documents', TXT: 'Documents', RTF: 'Documents',
  XLS: 'Spreadsheets', XLSX: 'Spreadsheets', CSV: 'Spreadsheets',
  PPT: 'Presentations', PPTX: 'Presentations',
  PNG: 'Images', JPG: 'Images', JPEG: 'Images', GIF: 'Images', SVG: 'Images', WEBP: 'Images', BMP: 'Images',
  MP4: 'Videos', MOV: 'Videos', AVI: 'Videos', WEBM: 'Videos', MKV: 'Videos',
  ZIP: 'Archives', RAR: 'Archives', '7Z': 'Archives',
  'ORGS-DOC': 'ORGs Files', 'ORGS-SHEET': 'ORGs Files', 'ORGS-DESIGN': 'ORGs Files',
};

export function getCategory(extension: string): FormatCategory {
  return FORMAT_CATEGORIES[extension.toUpperCase()] ?? 'Other';
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
