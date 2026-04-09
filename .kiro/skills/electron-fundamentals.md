# Electron Fundamentals — Skill Reference

Source: https://www.electronjs.org/docs/latest

---

## What is Electron?

Electron is a framework for building **cross-platform desktop applications** using JavaScript, HTML, and CSS. It embeds **Chromium** (for rendering) and **Node.js** (for system access) into a single binary, allowing one JavaScript codebase to run on Windows, macOS, and Linux.

---

## Process Model

Electron inherits Chromium's **multi-process architecture**. There are two core process types:

### 1. Main Process
- Single process — the app's entry point (`main.ts` / `main.js`)
- Runs in a full **Node.js environment** — has access to all Node.js APIs and Electron's native modules
- Responsibilities:
  - Create and manage `BrowserWindow` instances
  - Control app lifecycle via the `app` module
  - Access native OS APIs (menus, dialogs, tray, notifications, file system)
  - Handle IPC messages from renderer processes

```js
const { app, BrowserWindow } = require('electron')

function createWindow() {
  const win = new BrowserWindow({
    width: 800, height: 600,
    webPreferences: { preload: path.join(__dirname, 'preload.js') }
  })
  win.loadFile('index.html') // or win.loadURL('http://localhost:5173')
}

app.whenReady().then(createWindow)
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit() })
```

### 2. Renderer Process
- One per `BrowserWindow` — renders the web UI (React, HTML, CSS)
- Runs in a **Chromium context** — behaves like a browser tab
- **No direct Node.js access** by default (security)
- Communicates with main process via IPC only

### 3. Preload Script
- Runs **before** the renderer loads, in a special isolated context
- Has access to both Node.js APIs AND the DOM
- Bridge between main and renderer via `contextBridge`

---

## Context Isolation

Enabled by default since Electron 12. Ensures the preload script and Electron internals run in a **separate context** from the web page — prevents the renderer from accessing Node.js or Electron APIs directly.

```ts
// preload.ts — CORRECT pattern
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electronAPI', {
  // Expose only specific, safe methods — never expose raw ipcRenderer
  selectDirectory: () => ipcRenderer.invoke('select-directory'),
  readFile: (path: string) => ipcRenderer.invoke('fs-read-file', path),
})
```

```ts
// renderer (React) — access via window.electronAPI
window.electronAPI.selectDirectory()
```

**Security rule:** Never expose `ipcRenderer.send` directly. Always wrap in named methods.

---

## IPC (Inter-Process Communication)

The **only** way for renderer ↔ main to communicate. Uses named channels.

### Pattern 1: Renderer → Main (one-way)
```ts
// main.ts
ipcMain.on('channel-name', (event, ...args) => { /* handle */ })

// preload.ts
contextBridge.exposeInMainWorld('api', {
  doThing: (arg) => ipcRenderer.send('channel-name', arg)
})
```

### Pattern 2: Renderer → Main → Renderer (two-way, invoke/handle)
```ts
// main.ts
ipcMain.handle('get-data', async (event, arg) => {
  return await someAsyncOperation(arg)
})

// preload.ts
contextBridge.exposeInMainWorld('api', {
  getData: (arg) => ipcRenderer.invoke('get-data', arg)
})

// renderer
const result = await window.api.getData('hello')
```

### Pattern 3: Main → Renderer (push)
```ts
// main.ts — push to renderer
mainWindow.webContents.send('update-available')

// preload.ts
contextBridge.exposeInMainWorld('api', {
  onUpdate: (cb) => ipcRenderer.on('update-available', cb)
})
```

---

## Key Electron Modules

### Main Process Only
| Module | Purpose |
|--------|---------|
| `app` | App lifecycle (ready, quit, activate) |
| `BrowserWindow` | Create/manage windows |
| `ipcMain` | Receive IPC from renderer |
| `dialog` | Native file/folder/message dialogs |
| `shell` | Open URLs, files with OS default app |
| `Notification` | Desktop notifications |
| `safeStorage` | OS-level encrypted storage (keychain) |
| `autoUpdater` | Auto-update via electron-updater |
| `Menu` / `Tray` | Native menus and system tray |

### Renderer / Preload
| Module | Purpose |
|--------|---------|
| `ipcRenderer` | Send IPC to main |
| `contextBridge` | Safely expose APIs to renderer |

---

## Security Best Practices

1. **Always enable `contextIsolation: true`** (default since v12)
2. **Never enable `nodeIntegration: true`** in renderer
3. **Use `contextBridge`** — never attach to `window` directly in preload
4. **Validate all IPC inputs** in main process before executing
5. **Use `sandbox: false` carefully** — only when Node.js access is needed in preload
6. **`webSecurity: true`** — never disable unless absolutely necessary

```ts
// Correct BrowserWindow security config
new BrowserWindow({
  webPreferences: {
    preload: path.join(__dirname, 'preload.js'),
    contextIsolation: true,   // ✅ always true
    nodeIntegration: false,   // ✅ always false
    sandbox: false,           // needed if preload uses Node.js APIs
  }
})
```

---

## File System Access (via IPC)

Since renderer has no Node.js access, all file operations go through IPC:

```ts
// main.ts
import fs from 'fs'
import path from 'path'

ipcMain.handle('fs-write-file', async (_e, filePath: string, data: Buffer) => {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, data)
})

ipcMain.handle('fs-read-file', async (_e, filePath: string) => {
  return fs.readFileSync(filePath)
})

ipcMain.handle('select-directory', async () => {
  const result = await dialog.showOpenDialog({ properties: ['openDirectory'] })
  return result.canceled ? null : result.filePaths[0]
})
```

---

## App Packaging with electron-builder

```json
// package.json
{
  "main": "dist-electron/main.cjs",
  "build": {
    "appId": "com.myapp.id",
    "productName": "MyApp",
    "files": ["dist/**/*", "dist-electron/**/*"],
    "win": { "target": "nsis" },
    "mac": { "target": "dmg" },
    "linux": { "target": ["AppImage", "deb"] }
  }
}
```

**Important on Windows:** `package.json` with `"type": "module"` requires Electron main output to use `.cjs` extension (CommonJS), not `.js`.

```js
// scripts/build-electron.mjs — use esbuild for fast compilation
await build({
  entryPoints: ['electron/main.ts', 'electron/preload.ts'],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  outdir: 'dist-electron',
  outExtension: { '.js': '.cjs' },  // ← critical for ESM package.json
  external: ['electron', 'electron-updater'],
})
```

---

## Dev Workflow (Vite + Electron)

Two terminals:

```bash
# Terminal 1 — start Vite dev server
npm run dev   # → http://localhost:5173

# Terminal 2 — build electron main + launch
node scripts/build-electron.mjs
$env:NODE_ENV="development"; npx electron .
```

In `main.ts`, detect dev mode and load Vite URL:
```ts
if (process.env.NODE_ENV === 'development') {
  win.loadURL('http://localhost:5173')
  win.webContents.openDevTools()
} else {
  win.loadFile(path.join(__dirname, '../dist/index.html'))
}
```

---

## Common Pitfalls

| Problem | Cause | Fix |
|---------|-------|-----|
| Blank window | Wrong `main` path in package.json | Ensure `"main": "dist-electron/main.cjs"` |
| `require is not defined` | ESM package + CJS output mismatch | Use `.cjs` extension for electron output |
| Electron default screen shows | `main.js` not found or crashed | Check `dist-electron/` exists and has no errors |
| `selectDirectory` does nothing | Running in browser, not Electron | Use `isElectron()` guard + browser fallback |
| IPC not working | `nodeIntegration: false` + no preload | Always use contextBridge in preload |
| `safeStorage` unavailable | App not packaged / no keychain | Falls back gracefully in dev mode |

---

## TypeScript Declaration for contextBridge

```ts
// src/lib/electron/electronBridge.ts
declare global {
  interface Window {
    electronAPI?: {
      selectDirectory(): Promise<string | null>
      readFile(path: string): Promise<Buffer>
      writeFile(path: string, data: Buffer): Promise<void>
      // ... etc
    }
  }
}

export function isElectron(): boolean {
  return typeof window !== 'undefined' && !!window.electronAPI
}
```

---

*Content sourced from [electronjs.org/docs/latest](https://www.electronjs.org/docs/latest) — paraphrased for compliance with licensing restrictions.*
