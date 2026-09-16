/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { BrowserWindow } from 'electron'

/** 已挂 bridge preload 的内嵌页会话（按 webContents.id） */
export interface IBridgeSession {
  /** 宿主标识，如 workbench */
  host: string
  tabId?: string
  win?: BrowserWindow
}

const sessions = new Map<number, IBridgeSession>()

/** 注册内嵌页 bridge 会话（能力包 WebContentsView 创建时调用） */
export function registerBridgeSession(webContentsId: number, session: IBridgeSession): void {
  sessions.set(webContentsId, session)
}

/** 注销内嵌页 bridge 会话（关闭内嵌页时调用） */
export function unregisterBridgeSession(webContentsId: number): void {
  sessions.delete(webContentsId)
}

/** 取内嵌页 bridge 会话（宿主 bridge IPC handler 按 webContents.id 查） */
export function getBridgeSession(webContentsId: number): IBridgeSession | null {
  return sessions.get(webContentsId) || null
}
