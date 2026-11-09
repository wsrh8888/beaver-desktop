/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { Application } from '@beaver-im/beaver'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { ApplicationBase, Logger, getDirname } from '@beaver-im/beaver/main'

const logger = new Logger('doc')

/** 在线文档窗口：左侧空间/节点树 + 中间 TipTap 协同编辑器 + 右侧 presence/历史/分享 */
class Doc extends ApplicationBase implements Application {
  constructor() {
    super('doc')
  }

  public createBrowserWindow(): BrowserWindow {
    logger.info({ text: 'createBrowserWindow 开始' })
    this.win = new BrowserWindow({
      width: 1200,
      minWidth: 960,
      minHeight: 680,
      frame: false,
      resizable: true,
      webPreferences: {
        preload: path.join(getDirname(), './preload/index.mjs'),
        nodeIntegration: false,
        nodeIntegrationInWorker: false,
        contextIsolation: true,
        webSecurity: false,
        devTools: true,
        additionalArguments: [`--custom=${JSON.stringify({ ...this.getPreloadParams() })}`],
      },
    })
    this.win.setFullScreenable(false)

    this.loadRender()
    this.init()
    this.initEvents()
    return this.win
  }
}

export default new Doc()
