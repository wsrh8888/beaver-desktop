/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
