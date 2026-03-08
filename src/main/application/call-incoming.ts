import type { Application } from 'commonModule/type/app/application'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { __dirname } from 'mainModule/config'
import ApplicationBase from './common/base'

/**
 * 来电提示窗口 - 小窗口，用于显示来电邀请
 * 每个来电会创建一个独立的窗口，用 roomId 区分
 */
class CallIncomingApplication extends ApplicationBase implements Application {
  // 存储所有来电窗口 Map<roomId, BrowserWindow>
  private incomingWindows: Map<string, BrowserWindow> = new Map()

  constructor() {
    super('call-incoming')
  }

  public createBrowserWindow(): BrowserWindow {
    this.win = new BrowserWindow({
      width: 360,
      height: 180,
      minWidth: 320,
      minHeight: 160,
      frame: false,
      resizable: true,
      webPreferences: {
        preload: path.join(__dirname, './preload/index.mjs'),
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: true,
        webSecurity: false,
        devTools: true,
        additionalArguments: [`--custom=${JSON.stringify({ ...this.getPreloadParams() })}`],
      },
    })

    this.win.center()
    this.win.setAlwaysOnTop(true, 'screen-saver')

    // 加载渲染器
    this.loadRender()
    this.init()
    this.initEvents()
    return this.win
  }

  /**
   * 关闭指定 roomId 的来电窗口
   */
  public closeByRoomId(roomId: string) {
    const win = this.incomingWindows.get(roomId)
    if (win && !win.isDestroyed()) {
      win.close()
    }
    this.incomingWindows.delete(roomId)
  }

  /**
   * 获取指定 roomId 的窗口
   */
  public getWindowByRoomId(roomId: string): BrowserWindow | undefined {
    return this.incomingWindows.get(roomId)
  }

  /**
   * 获取所有来电窗口
   */
  public getAllWindows(): Map<string, BrowserWindow> {
    return this.incomingWindows
  }
}

export default new CallIncomingApplication()
