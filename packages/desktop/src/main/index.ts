import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import { checkEnvironment, createProject, type CreateProjectOptions } from "@luucaohoang/lumit-core";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
const electron = require("electron") as typeof import("electron");
const { app, BrowserWindow, dialog, ipcMain, shell } = electron;

let mainWindow: Electron.BrowserWindow | undefined;

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 760,
    minWidth: 900,
    minHeight: 640,
    webPreferences: {
      preload: path.resolve(__dirname, "../preload/index.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  await mainWindow.loadFile(path.resolve(__dirname, "../renderer/index.html"));
}

app.whenReady().then(async () => {
  registerIpc();
  await createWindow();

  app.on("activate", async () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      await createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

function registerIpc(): void {
  ipcMain.handle("folder:select", async () => {
    const result = await dialog.showOpenDialog({
      properties: ["openDirectory", "createDirectory"]
    });

    return result.canceled ? undefined : result.filePaths[0];
  });

  ipcMain.handle("environment:check", async () => checkEnvironment());

  ipcMain.handle("project:create", async (event, options: CreateProjectOptions) => {
    return createProject(options, {
      onStep: (step) => event.sender.send("project:event", { type: "step", payload: step }),
      onLog: (log) => event.sender.send("project:event", { type: "log", payload: log })
    });
  });

  ipcMain.handle("folder:open", async (_event, folderPath: string) => {
    await shell.openPath(folderPath);
  });

  ipcMain.handle("vscode:open", async (_event, folderPath: string) => {
    const child = spawn("code", [folderPath], {
      detached: true,
      stdio: "ignore",
      shell: process.platform === "win32"
    });
    child.unref();
  });

  ipcMain.handle("url:open", async (_event, url: string) => {
    await shell.openExternal(url);
  });
}
