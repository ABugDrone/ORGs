// Type-safe wrapper around window.electronAPI (exposed via preload.ts)
// Falls back gracefully when running in a browser (non-Electron) context.

export interface DirEntry {
  name: string
  isDirectory: boolean
}

export interface ElectronAPI {
  selectDirectory(): Promise<string | null>
  readFile(filePath: string): Promise<Buffer>
  writeFile(filePath: string, data: Buffer): Promise<void>
  deleteFile(filePath: string): Promise<void>
  renameFile(oldPath: string, newPath: string): Promise<void>
  ensureDir(dirPath: string): Promise<void>
  fileExists(filePath: string): Promise<boolean>
  copyFile(src: string, dest: string): Promise<void>
  readDir(dirPath: string): Promise<DirEntry[]>
  openWithDefault(filePath: string): Promise<void>
  showNotification(title: string, body: string): Promise<void>
  storeSecret(key: string, value: string): Promise<void>
  retrieveSecret(key: string): Promise<string | null>
  deleteSecret(key: string): Promise<void>
  getWindowBounds(): Promise<{ x: number; y: number; width: number; height: number } | null>
  getUserDataPath(): Promise<string>
  installUpdate(): Promise<void>
  onUpdateAvailable(cb: () => void): void
  onUpdateDownloaded(cb: () => void): void
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI
}

// Returns the electronAPI or throws if not in Electron context
export function getElectronAPI(): ElectronAPI {
  if (!window.electronAPI) {
    throw new Error('electronAPI is not available — app is not running inside Electron')
  }
  return window.electronAPI
}

// Safe wrappers — return sensible defaults in browser context

export async function selectDirectory(): Promise<string | null> {
  if (!isElectron()) return null
  return window.electronAPI!.selectDirectory()
}

export async function writeFile(filePath: string, data: Buffer): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.writeFile(filePath, data)
}

export async function readFile(filePath: string): Promise<Buffer | null> {
  if (!isElectron()) return null
  return window.electronAPI!.readFile(filePath)
}

export async function deleteFile(filePath: string): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.deleteFile(filePath)
}

export async function renameFile(oldPath: string, newPath: string): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.renameFile(oldPath, newPath)
}

export async function ensureDir(dirPath: string): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.ensureDir(dirPath)
}

export async function fileExists(filePath: string): Promise<boolean> {
  if (!isElectron()) return false
  return window.electronAPI!.fileExists(filePath)
}

export async function copyFile(src: string, dest: string): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.copyFile(src, dest)
}

export async function readDir(dirPath: string): Promise<DirEntry[]> {
  if (!isElectron()) return []
  return window.electronAPI!.readDir(dirPath)
}

export async function openWithDefault(filePath: string): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.openWithDefault(filePath)
}

export async function showNotification(title: string, body: string): Promise<void> {
  if (!isElectron()) {
    console.info(`[Notification] ${title}: ${body}`)
    return
  }
  return window.electronAPI!.showNotification(title, body)
}

export async function storeSecret(key: string, value: string): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.storeSecret(key, value)
}

export async function retrieveSecret(key: string): Promise<string | null> {
  if (!isElectron()) return null
  return window.electronAPI!.retrieveSecret(key)
}

export async function deleteSecret(key: string): Promise<void> {
  if (!isElectron()) return
  return window.electronAPI!.deleteSecret(key)
}

export async function getUserDataPath(): Promise<string> {
  if (!isElectron()) return ''
  return window.electronAPI!.getUserDataPath()
}
