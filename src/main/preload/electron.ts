import { WinHook, RenderCommand } from "commonModule/type/ipc/command";
import { IEvent } from "commonModule/type/ipc/event";
import ipcRenderManager from "mainModule/utils/preload/ipcRender";
import { ILogger } from "commonModule/type/logger";
import type { ElectronAPP } from "commonModule/type/preload/window";

function parseAdditionalArguments() {
  const args = process.argv.slice(1);
  let params = {
    appRootPath: "",
    env: "prod" as "prod" | "test",
    token: undefined as string | undefined,
    devicedId: undefined as string | undefined,
  };
  args.forEach(arg => {
    const paramsPrefix = '--custom=';
    if (arg.startsWith(paramsPrefix)) {
      try {
        const customParams = JSON.parse(arg.substring(paramsPrefix.length));
        params = { ...params, ...customParams };
      } catch (e) {
        console.error('Failed to parse custom params from process arguments:', e);
      }
    }
  });
  return params;
}

const appParsedArgs = parseAdditionalArguments();

const { contextBridge } = require('electron');

// --- Logger Module ---
const loggerModule = {
  info: (data: ILogger, moduleName: string = "") => {
    ipcRenderManager.send(IEvent.RenderToMain, RenderCommand.LOG, { level: "info", message: data, moduleName: moduleName });
  },
  error: (data: ILogger, moduleName: string = "") => {
    ipcRenderManager.send(IEvent.RenderToMain, RenderCommand.LOG, { level: "error", message: data, moduleName: moduleName });
  },
  warn: (data: ILogger, moduleName: string = "") => {
    ipcRenderManager.send(IEvent.RenderToMain, RenderCommand.LOG, { level: "warn", message: data, moduleName: moduleName });
  }
};

// --- Window Management Module ---
const windowModule = {
  close: (name?: string) => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.CLOSE, { name: name });
  },
  open: (name: string) => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.OPEN, { name: name });
  },
  openWindow: (name: string) => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.OPEN, { name: name });
  },
  minimize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MINIMIZE);
  }
};

// --- Application Info Module ---
const appModule = {
  versions: process.versions,
  rootPath: appParsedArgs.appRootPath,
  token: appParsedArgs.token,
  env: appParsedArgs.env,
  devicedId: appParsedArgs.devicedId,
};

// --- Storage Module ---
const storageModule = {
  setData: (key: string, value: any) => {
    ipcRenderManager.send(IEvent.RenderToMain, RenderCommand.STORE, { key: key, value: value });
  },
  saveStore: (name: string, data: {}) => {
    return ipcRenderManager.invoke(IEvent.RenderToMain, RenderCommand.SAVESTORE, { name, data });
  }
};

// Define the new electron API structure
const electronAPI: ElectronAPP = {
  logger: loggerModule,
  window: windowModule,
  app: appModule,
  storage: storageModule,
};

// Expose the new API structure to the main world
contextBridge.exposeInMainWorld('electron', electronAPI);



