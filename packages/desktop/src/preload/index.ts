import { createRequire } from "node:module";
import type {
  CreateProjectOptions,
  CreateProjectResult,
  EnvironmentReport,
  ProjectLogEvent,
  ProjectStepEvent
} from "@luucaohoang/lumit-core";

const require = createRequire(import.meta.url);
const electron = require("electron") as typeof import("electron");
const { contextBridge, ipcRenderer } = electron;

export type DesktopProjectEvent =
  | { type: "step"; payload: ProjectStepEvent }
  | { type: "log"; payload: ProjectLogEvent };

const api = {
  selectFolder: (): Promise<string | undefined> => ipcRenderer.invoke("folder:select"),
  checkEnvironment: (): Promise<EnvironmentReport> => ipcRenderer.invoke("environment:check"),
  createProject: (options: CreateProjectOptions): Promise<CreateProjectResult> => ipcRenderer.invoke("project:create", options),
  openFolder: (folderPath: string): Promise<void> => ipcRenderer.invoke("folder:open", folderPath),
  openVSCode: (folderPath: string): Promise<void> => ipcRenderer.invoke("vscode:open", folderPath),
  openUrl: (url: string): Promise<void> => ipcRenderer.invoke("url:open", url),
  onProjectEvent: (callback: (event: DesktopProjectEvent) => void): (() => void) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: DesktopProjectEvent): void => callback(payload);
    ipcRenderer.on("project:event", listener);
    return () => ipcRenderer.removeListener("project:event", listener);
  }
};

contextBridge.exposeInMainWorld("lumit", api);

export type LumitDesktopApi = typeof api;
