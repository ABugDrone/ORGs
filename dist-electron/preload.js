"use strict";

// electron/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("electronAPI", {
  // Directory picker
  selectDirectory: () => import_electron.ipcRenderer.invoke("select-directory"),
  // File system
  readFile: (filePath) => import_electron.ipcRenderer.invoke("fs-read-file", filePath),
  writeFile: (filePath, data) => import_electron.ipcRenderer.invoke("fs-write-file", filePath, data),
  deleteFile: (filePath) => import_electron.ipcRenderer.invoke("fs-delete-file", filePath),
  renameFile: (oldPath, newPath) => import_electron.ipcRenderer.invoke("fs-rename-file", oldPath, newPath),
  ensureDir: (dirPath) => import_electron.ipcRenderer.invoke("fs-ensure-dir", dirPath),
  fileExists: (filePath) => import_electron.ipcRenderer.invoke("fs-file-exists", filePath),
  copyFile: (src, dest) => import_electron.ipcRenderer.invoke("fs-copy-file", src, dest),
  readDir: (dirPath) => import_electron.ipcRenderer.invoke("fs-read-dir", dirPath),
  // Open with OS default app
  openWithDefault: (filePath) => import_electron.ipcRenderer.invoke("open-with-default", filePath),
  // Notifications
  showNotification: (title, body) => import_electron.ipcRenderer.invoke("show-notification", title, body),
  // Secure storage
  storeSecret: (key, value) => import_electron.ipcRenderer.invoke("store-secret", key, value),
  retrieveSecret: (key) => import_electron.ipcRenderer.invoke("retrieve-secret", key),
  deleteSecret: (key) => import_electron.ipcRenderer.invoke("delete-secret", key),
  // Window
  getWindowBounds: () => import_electron.ipcRenderer.invoke("get-window-bounds"),
  getUserDataPath: () => import_electron.ipcRenderer.invoke("get-user-data-path"),
  // Auto-updater
  installUpdate: () => import_electron.ipcRenderer.invoke("install-update"),
  onUpdateAvailable: (cb) => import_electron.ipcRenderer.on("update-available", cb),
  onUpdateDownloaded: (cb) => import_electron.ipcRenderer.on("update-downloaded", cb)
});
//# sourceMappingURL=preload.js.map
