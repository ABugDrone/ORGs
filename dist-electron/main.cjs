"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// electron/main.ts
var import_electron = require("electron");
var import_electron_updater = require("electron-updater");
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var STATE_FILE = import_path.default.join(import_electron.app.getPath("userData"), "window-state.json");
function loadWindowState() {
  try {
    const data = import_fs.default.readFileSync(STATE_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return { width: 1280, height: 800 };
  }
}
function saveWindowState(win) {
  const bounds = win.getBounds();
  import_fs.default.writeFileSync(STATE_FILE, JSON.stringify(bounds));
}
var mainWindow = null;
function createWindow() {
  const state = loadWindowState();
  mainWindow = new import_electron.BrowserWindow({
    x: state.x,
    y: state.y,
    width: state.width,
    height: state.height,
    minWidth: 900,
    minHeight: 600,
    title: "ORGs \u2014 Organizational Reports Gathering System",
    webPreferences: {
      preload: import_path.default.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    },
    frame: true,
    show: false
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else if (process.env.NODE_ENV === "development") {
    mainWindow.loadURL("http://localhost:8080");
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(import_path.default.join(__dirname, "../dist/index.html"));
  }
  mainWindow.once("ready-to-show", () => {
    mainWindow?.show();
  });
  mainWindow.on("close", () => {
    if (mainWindow) saveWindowState(mainWindow);
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    import_electron.shell.openExternal(url);
    return { action: "deny" };
  });
}
import_electron.app.whenReady().then(() => {
  createWindow();
  setupIpcHandlers();
  if (!process.env.VITE_DEV_SERVER_URL) {
    import_electron_updater.autoUpdater.checkForUpdatesAndNotify();
  }
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") import_electron.app.quit();
});
function setupIpcHandlers() {
  import_electron.ipcMain.handle("select-directory", async () => {
    const result = await import_electron.dialog.showOpenDialog(mainWindow, {
      properties: ["openDirectory"]
    });
    return result.canceled ? null : result.filePaths[0];
  });
  import_electron.ipcMain.handle("fs-read-file", async (_e, filePath) => {
    return import_fs.default.readFileSync(filePath);
  });
  import_electron.ipcMain.handle("fs-write-file", async (_e, filePath, data) => {
    import_fs.default.mkdirSync(import_path.default.dirname(filePath), { recursive: true });
    import_fs.default.writeFileSync(filePath, data);
  });
  import_electron.ipcMain.handle("fs-delete-file", async (_e, filePath) => {
    if (import_fs.default.existsSync(filePath)) import_fs.default.unlinkSync(filePath);
  });
  import_electron.ipcMain.handle("fs-rename-file", async (_e, oldPath, newPath) => {
    import_fs.default.renameSync(oldPath, newPath);
  });
  import_electron.ipcMain.handle("fs-ensure-dir", async (_e, dirPath) => {
    import_fs.default.mkdirSync(dirPath, { recursive: true });
  });
  import_electron.ipcMain.handle("fs-file-exists", async (_e, filePath) => {
    return import_fs.default.existsSync(filePath);
  });
  import_electron.ipcMain.handle("fs-copy-file", async (_e, src, dest) => {
    import_fs.default.mkdirSync(import_path.default.dirname(dest), { recursive: true });
    import_fs.default.copyFileSync(src, dest);
  });
  import_electron.ipcMain.handle("fs-read-dir", async (_e, dirPath) => {
    if (!import_fs.default.existsSync(dirPath)) return [];
    return import_fs.default.readdirSync(dirPath, { withFileTypes: true }).map((d) => ({
      name: d.name,
      isDirectory: d.isDirectory()
    }));
  });
  import_electron.ipcMain.handle("open-with-default", async (_e, filePath) => {
    await import_electron.shell.openPath(filePath);
  });
  import_electron.ipcMain.handle("show-notification", async (_e, title, body) => {
    if (import_electron.Notification.isSupported()) {
      new import_electron.Notification({ title, body }).show();
    }
  });
  import_electron.ipcMain.handle("store-secret", async (_e, key, value) => {
    const { safeStorage } = await import("electron");
    const encrypted = safeStorage.encryptString(value);
    const secretsDir = import_path.default.join(import_electron.app.getPath("userData"), "secrets");
    import_fs.default.mkdirSync(secretsDir, { recursive: true });
    import_fs.default.writeFileSync(import_path.default.join(secretsDir, `${key}.enc`), encrypted);
  });
  import_electron.ipcMain.handle("retrieve-secret", async (_e, key) => {
    const { safeStorage } = await import("electron");
    const secretPath = import_path.default.join(import_electron.app.getPath("userData"), "secrets", `${key}.enc`);
    if (!import_fs.default.existsSync(secretPath)) return null;
    const encrypted = import_fs.default.readFileSync(secretPath);
    return safeStorage.decryptString(encrypted);
  });
  import_electron.ipcMain.handle("delete-secret", async (_e, key) => {
    const secretPath = import_path.default.join(import_electron.app.getPath("userData"), "secrets", `${key}.enc`);
    if (import_fs.default.existsSync(secretPath)) import_fs.default.unlinkSync(secretPath);
  });
  import_electron.ipcMain.handle("get-window-bounds", () => {
    return mainWindow?.getBounds() ?? null;
  });
  import_electron.ipcMain.handle("get-user-data-path", () => {
    return import_electron.app.getPath("userData");
  });
}
import_electron_updater.autoUpdater.on("update-available", () => {
  mainWindow?.webContents.send("update-available");
});
import_electron_updater.autoUpdater.on("update-downloaded", () => {
  mainWindow?.webContents.send("update-downloaded");
});
import_electron.ipcMain.handle("install-update", () => {
  import_electron_updater.autoUpdater.quitAndInstall();
});
//# sourceMappingURL=main.cjs.map
