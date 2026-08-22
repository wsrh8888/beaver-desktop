import type { BrowserWindow } from 'electron'

export interface IBridgeSession {
  /** 宿主标识，如 workbench */
  host: string
  tabId?: string
  win?: BrowserWindow
}

/** 已挂 bridge preload 的内嵌页会话（按 webContents.id） */
class BridgeRegistry {
  private sessions = new Map<number, IBridgeSession>()

  register(webContentsId: number, session: IBridgeSession) {
    this.sessions.set(webContentsId, session)
  }

  unregister(webContentsId: number) {
    this.sessions.delete(webContentsId)
  }

  get(webContentsId: number): IBridgeSession | null {
    return this.sessions.get(webContentsId) || null
  }
}

export default new BridgeRegistry()
