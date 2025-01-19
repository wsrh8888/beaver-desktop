import { ElectronCommand, RenderCommand, WinHook } from "commonModule/type/ipc/command";
import { IEvent } from "commonModule/type/ipc/event";
import ipcMainManager from "mainModule/utils/ipc/ipc-main-manager";
import logger from "mainModule/utils/log";
// import Screenshots from "electron-screenshots";
import { BrowserWindow } from "electron";
import { __dirname, getRootPath } from "mainModule/utils/config";
import { removeStore, saveStore } from "mainModule/utils/store/store";
import appApplication from "mainModule/application/app";
import loginApplication from "mainModule/application/login";

class IpcManager {
  // private screenshots: Screenshots;

  constructor() {
    // this.screenshots = new Screenshots();
    this.initIpcListeners();
  }

  private initIpcListeners() {
    ipcMainManager.on(
      IEvent.RenderToMainMsg,
      (event: Electron.IpcMainEvent, command: WinHook | RenderCommand | ElectronCommand , data: any = {}): void => {
        console.error('bbbbbbbbbbbbbbbbxcccccccccccccccccccccccccc', command)
        switch (command) {
          case RenderCommand.LOG:
            // this.logWrite(event, data);
            break;
          case WinHook.CLOSE:
            this.closeRender(event);
            break;
          case WinHook.MINIMIZE:
            this.minimizeRender(event);
            break;
          case RenderCommand.STORE:
            this.storeInfo(event, data);
            break;
          case WinHook.OPEN:
            this.openMiniApp(data);
            break;
          default:
            logger.error(`IEvent.RenderToMainMsg 未知命令: ${command}`);
        }
      }
    );

    ipcMainManager.handle(
      IEvent.RenderToMainSyncMsg,
      async (_vent: Electron.IpcMainInvokeEvent, command: ElectronCommand, data): Promise<unknown> => {
        logger.info(`[main] 收到同步消息, command: ${command}, data: ${JSON.stringify(data)}`);
        switch (command) {
         
        }
      }
    );
  }

  private storeInfo(event: Electron.IpcMainEvent, data: any) {
    console.log('111111111111111111111', data)
    saveStore(data.key, data.value);
  }

   /**
   * @description: 打开一个渲染进程
   * @param {Electron.IpcMainEvent} _event
   * @param {string} id
   */
   private openMiniApp(data: { name: string }) {
    console.error('收到了消息', data)
    if (data.name === "app") {
      appApplication.createBrowserWindow();
      loginApplication.closeBrowserWindow();
    }else if (data.name === "login") {
      loginApplication.createBrowserWindow();
      appApplication.closeBrowserWindow();
      removeStore("loginInfo")
      // 
      // 清除缓存
      // appApplication.clearCache();
    }
  }

  /**
   * @description: 最小化窗口
   */  
  private minimizeRender(event: Electron.IpcMainEvent) {
    const frameName = process.custom.RENDER.get(event.frameId)?.name || "unknown";
    logger.info(`[render][${frameName}][${event.sender.id}] 最小化窗口`);

    const window = BrowserWindow.fromWebContents(event.sender);
    if (window) {
      window.minimize();
    } else {
      logger.error(`[render][${frameName}][${event.sender.id}] 无法获取窗口实例`);
    }
  }

  /**
   * @description: 关闭窗口
   */  
  private closeRender(event: Electron.IpcMainEvent) {
    const frameName = process.custom.RENDER.get(event.frameId)?.name || "unknown";
    logger.info(`[render][${frameName}][${event.sender.id}] 关闭窗口`);
    event.sender.close();
  }
  /**
   * @description: 写日志
   * @param {Electron} event
   * @param {any} data
   */  
  private logWrite(event: Electron.IpcMainEvent, data: any) {
    const frameName = process.custom.RENDER.get(event.frameId)?.name || "unknown";
    logger.info(`[${frameName}][${event.sender.id}] ${JSON.stringify(data)}`);
  }
}


export default IpcManager;