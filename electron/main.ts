import { app, BrowserWindow, ipcMain, shell, dialog, Notification } from 'electron'
import { autoUpdater } from 'electron-updater'
import path from 'path'
import fs from 'fs'

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

app.whenReady().then(() => {
  createWindow()
  setupIpcHandlers()

  // Auto-updater (production only)
  if (!process.env.VITE_DEV_SERVER_URL) {
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

  // File system operations
  ipcMain.handle('fs-read-file', async (_e, filePath: string) => {
    return fs.readFileSync(filePath)
  })

  ipcMain.handle('fs-write-file', async (_e, filePath: string, data: Buffer) => {
    fs.mkdirSync(path.dirname(filePath), { recursive: true })
    fs.writeFileSync(filePath, data)
  })

  ipcMain.handle('fs-delete-file', async (_e, filePath: string) => {
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)
  })

  ipcMain.handle('fs-rename-file', async (_e, oldPath: string, newPath: string) => {
    fs.renameSync(oldPath, newPath)
  })

  ipcMain.handle('fs-ensure-dir', async (_e, dirPath: string) => {
    fs.mkdirSync(dirPath, { recursive: true })
  })

  ipcMain.handle('fs-file-exists', async (_e, filePath: string) => {
    return fs.existsSync(filePath)
  })

  ipcMain.handle('fs-copy-file', async (_e, src: string, dest: string) => {
    fs.mkdirSync(path.dirname(dest), { recursive: true })
    fs.copyFileSync(src, dest)
  })

  ipcMain.handle('fs-read-dir', async (_e, dirPath: string) => {
    if (!fs.existsSync(dirPath)) return []
    return fs.readdirSync(dirPath, { withFileTypes: true }).map(d => ({
      name: d.name,
      isDirectory: d.isDirectory(),
    }))
  })

  // Open file with OS default application
  ipcMain.handle('open-with-default', async (_e, filePath: string) => {
    await shell.openPath(filePath)
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

// Auto-updater events
autoUpdater.on('update-available', () => {
  mainWindow?.webContents.send('update-available')
})

autoUpdater.on('update-downloaded', () => {
  mainWindow?.webContents.send('update-downloaded')
})

ipcMain.handle('install-update', () => {
  autoUpdater.quitAndInstall()
})
