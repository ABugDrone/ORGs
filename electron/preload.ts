import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Directory picker
  selectDirectory: () => ipcRenderer.invoke('select-directory'),

  // File system
  readFile: (filePath: string) => ipcRenderer.invoke('fs-read-file', filePath),
  writeFile: (filePath: string, data: Buffer) => ipcRenderer.invoke('fs-write-file', filePath, data),
  deleteFile: (filePath: string) => ipcRenderer.invoke('fs-delete-file', filePath),
  renameFile: (oldPath: string, newPath: string) => ipcRenderer.invoke('fs-rename-file', oldPath, newPath),
  ensureDir: (dirPath: string) => ipcRenderer.invoke('fs-ensure-dir', dirPath),
  fileExists: (filePath: string) => ipcRenderer.invoke('fs-file-exists', filePath),
  copyFile: (src: string, dest: string) => ipcRenderer.invoke('fs-copy-file', src, dest),
  readDir: (dirPath: string) => ipcRenderer.invoke('fs-read-dir', dirPath),

  // Open with OS default app
  openWithDefault: (filePath: string) => ipcRenderer.invoke('open-with-default', filePath),

  // Notifications
  showNotification: (title: string, body: string) => ipcRenderer.invoke('show-notification', title, body),

  // Secure storage
  storeSecret: (key: string, value: string) => ipcRenderer.invoke('store-secret', key, value),
  retrieveSecret: (key: string) => ipcRenderer.invoke('retrieve-secret', key),
  deleteSecret: (key: string) => ipcRenderer.invoke('delete-secret', key),

  // Window
  getWindowBounds: () => ipcRenderer.invoke('get-window-bounds'),
  getUserDataPath: () => ipcRenderer.invoke('get-user-data-path'),

  // Auto-updater
  installUpdate: () => ipcRenderer.invoke('install-update'),
  onUpdateAvailable: (cb: () => void) => ipcRenderer.on('update-available', cb),
  onUpdateDownloaded: (cb: () => void) => ipcRenderer.on('update-downloaded', cb),
})
