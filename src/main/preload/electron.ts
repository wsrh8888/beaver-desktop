import { WinHook, RenderCommand, ElectronCommand } from "commonModule/type/ipc/command";
import { ElectronAPP } from "commonModule/type/preload/window";
import { IEvent } from "commonModule/type/ipc/event";
import ipcRenderManager from "mainModule/utils/preload/ipcRender";

function parseAdditionalArguments() {
  const args = process.argv.slice(1);
  let params  = {
    appRootPath: "",
    env: "prod",
  }; 
  console.error('111111111111111', args);
  args.forEach(arg => {
    if (arg.startsWith('--custom=')) {
      try {
        params = JSON.parse(arg.substring('--params='.length));
      } catch (e) {
        console.error('Failed to parse params:', e);
      }
    }
  });

  return params;
}


const { contextBridge, ipcRenderer} = require('electron')

const electron: ElectronAPP = {
  closeWindow(name?: string) {
    ipcRenderManager.send(IEvent.RenderToMainMsg, WinHook.CLOSE, { name: name })
  },
  openWindow (name: string) {
    console.error('bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb')
    ipcRenderManager.send(IEvent.RenderToMainMsg, WinHook.OPEN, { name: name })
  },
  getAppVersion: process.versions,
  log(level, data) {
    ipcRenderManager.send(IEvent.RenderToMainMsg, RenderCommand.LOG, { level:level, data: data })
  },
  getAppRootPath: parseAdditionalArguments().appRootPath,
  closeApp() {
    ipcRenderManager.send(IEvent.RenderToMainMsg, WinHook.CLOSE);
  },
  minimizeApp() {
    ipcRenderManager.send(IEvent.RenderToMainMsg, WinHook.MINIMIZE);
  },
  storeData(key, value) {
    ipcRenderManager.send(IEvent.RenderToMainMsg, RenderCommand.STORE, { key: key, value: value });
  },
  token: parseAdditionalArguments().token,
  env: parseAdditionalArguments().env,
  page: {
    setTitle(title: string) {
      ipcRenderer.sendToHost('set-title', title);
    },
  },
};


contextBridge.exposeInMainWorld('electron', electron);
globalThis.electron = window.electron;



