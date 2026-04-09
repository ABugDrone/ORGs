import { app, BrowserWindow, ipcMain, shell, dialog, Notification, session } from 'electron'
import path from 'path'
import fs from 'fs'

// electron-updater is optional — only available in packaged builds with publish config
let autoUpdater: any = null
try {
  autoUpdater = require('electron-updater').autoUpdater
} catch {
  // Not available in portable/dev builds — skip silently
}

// Window state persistence
const STATE_FILE = path.join(app.getPath('userData'), 'window-state.json')

interface WindowState {
  x?: number
  y?: number
  width: number
  height: number
}

function loadWindowState(): WindowState {
  try {
    const data = fs.readFileSync(STATE_FILE, 'utf-8')
    return JSON.parse(data)
  } catch {
    return { width: 1280, height: 800 }
  }
}

function saveWindowState(win: BrowserWindow) {
  const bounds = win.getBounds()
  fs.writeFileSync(STATE_FILE, JSON.stringify(bounds))
}

let mainWindow: BrowserWindow | null = null

function createWindow() {
  const state = loadWindowState()

  mainWindow = new BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 900,
    minHeight: 600,
    title: 'ORGs — Organizational Reports Gathering System',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
    frame: true,
    show: false,
  })

  // Load app
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL)
    mainWindow.webContents.openDevTools()
  } else if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:8080')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show()
  })

  mainWindow.on('close', () => {
    if (mainWindow) saveWindowState(mainWindow)
  })

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  // Open external links in default browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: 'deny' }
  })
}

// ── Path validation helpers ───────────────────────────────────────────────────

/** In-memory allowed base directories, set via IPC from the renderer. */
let allowedBaseDirs: string[] = [];

/**
 * Validates that a resolved file path starts with one of the allowed base dirs.
 * Throws if the path escapes the allowed scope.
 */
function validatePath(filePath: string): string {
  const resolved = path.resolve(filePath);
  // If no folders configured yet (first run), allow all paths so setup can proceed
  if (allowedBaseDirs.length === 0) return resolved;
  const ok = allowedBaseDirs.some(base => resolved.startsWith(base + path.sep) || resolved === base);
  if (!ok) {
    throw new Error(`Path traversal rejected: "${resolved}" is outside allowed directories.`);
  }
  return resolved;
}

app.whenReady().then(() => {
  // ── Content Security Policy ─────────────────────────────────────────────
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self'; media-src 'self' blob:; object-src 'none';"
        ],
      },
    });
  });

  createWindow()
  setupIpcHandlers()

  // Auto-updater (production only)
  if (!process.env.VITE_DEV_SERVER_URL && autoUpdater) {
    autoUpdater.checkForUpdatesAndNotify()
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ── IPC Handlers ──────────────────────────────────────────────────────────────

function setupIpcHandlers() {
  // Select a directory via native dialog
  ipcMain.handle('select-directory', async () => {
    const result = await dialog.showOpenDialog(mainWindow!, {
      properties: ['openDirectory'],
    })
    return result.canceled ? null : result.filePaths[0]
  })

  // Set allowed base directories for path validation (called by renderer after setup)
  ipcMain.handle('set-allowed-dirs', (_e, dirs: string[]) => {
    allowedBaseDirs = dirs.map(d => path.resolve(d)).filter(Boolean);
  })

  // File system operations
  ipcMain.handle('fs-read-file', async (_e, filePath: string) => {
    const safe = validatePath(filePath);
    return fs.readFileSync(safe)
  })

  ipcMain.handle('fs-write-file', async (_e, filePath: string, data: Buffer) => {
    const safe = validatePath(filePath);
    fs.mkdirSync(path.dirname(safe), { recursive: true })
    fs.writeFileSync(safe, data)
  })

  ipcMain.handle('fs-delete-file', async (_e, filePath: string) => {
    const safe = validatePath(filePath);
    if (fs.existsSync(safe)) fs.unlinkSync(safe)
  })

  ipcMain.handle('fs-rename-file', async (_e, oldPath: string, newPath: string) => {
    const safeOld = validatePath(oldPath);
    const safeNew = validatePath(newPath);
    fs.renameSync(safeOld, safeNew)
  })

  ipcMain.handle('fs-ensure-dir', async (_e, dirPath: string) => {
    const safe = validatePath(dirPath);
    fs.mkdirSync(safe, { recursive: true })
  })

  ipcMain.handle('fs-file-exists', async (_e, filePath: string) => {
    const safe = validatePath(filePath);
    return fs.existsSync(safe)
  })

  ipcMain.handle('fs-copy-file', async (_e, src: string, dest: string) => {
    const safeSrc = validatePath(src);
    const safeDest = validatePath(dest);
    fs.mkdirSync(path.dirname(safeDest), { recursive: true })
    fs.copyFileSync(safeSrc, safeDest)
  })

  ipcMain.handle('fs-read-dir', async (_e, dirPath: string) => {
    const safe = validatePath(dirPath);
    if (!fs.existsSync(safe)) return []
    return fs.readdirSync(safe, { withFileTypes: true }).map(d => ({
      name: d.name,
      isDirectory: d.isDirectory(),
    }))
  })

  ipcMain.handle('fs-stat', async (_e, filePath: string) => {
    const safe = validatePath(filePath);
    if (!fs.existsSync(safe)) return null;
    const stat = fs.statSync(safe);
    return { size: stat.size, mtimeMs: stat.mtimeMs };
  })

  // Open file with OS default application
  ipcMain.handle('open-with-default', async (_e, filePath: string) => {
    const safe = validatePath(filePath);
    await shell.openPath(safe)
  })

  // Desktop notification
  ipcMain.handle('show-notification', async (_e, title: string, body: string) => {
    if (Notification.isSupported()) {
      new Notification({ title, body }).show()
    }
  })

  // Secure storage (simple encrypted file via safeStorage)
  ipcMain.handle('store-secret', async (_e, key: string, value: string) => {
    const { safeStorage } = await import('electron')
    const encrypted = safeStorage.encryptString(value)
    const secretsDir = path.join(app.getPath('userData'), 'secrets')
    fs.mkdirSync(secretsDir, { recursive: true })
    fs.writeFileSync(path.join(secretsDir, `${key}.enc`), encrypted)
  })

  ipcMain.handle('retrieve-secret', async (_e, key: string) => {
    const { safeStorage } = await import('electron')
    const secretPath = path.join(app.getPath('userData'), 'secrets', `${key}.enc`)
    if (!fs.existsSync(secretPath)) return null
    const encrypted = fs.readFileSync(secretPath)
    return safeStorage.decryptString(encrypted)
  })

  ipcMain.handle('delete-secret', async (_e, key: string) => {
    const secretPath = path.join(app.getPath('userData'), 'secrets', `${key}.enc`)
    if (fs.existsSync(secretPath)) fs.unlinkSync(secretPath)
  })

  // Window bounds
  ipcMain.handle('get-window-bounds', () => {
    return mainWindow?.getBounds() ?? null
  })

  // Get app userData path (for IndexedDB / config storage reference)
  ipcMain.handle('get-user-data-path', () => {
    return app.getPath('userData')
  })
}

// Auto-updater events (only if available)
if (autoUpdater) {
  autoUpdater.on('update-available', () => {
    mainWindow?.webContents.send('update-available')
  })
  autoUpdater.on('update-downloaded', () => {
    mainWindow?.webContents.send('update-downloaded')
  })
}

ipcMain.handle('install-update', () => {
  if (autoUpdater) autoUpdater.quitAndInstall()
})
