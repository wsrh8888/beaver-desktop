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

import type { Application } from '@beaver-im/beaver'
import { createRequire } from 'node:module'
import path from 'node:path'
import { BrowserWindow } from 'electron'
import { ApplicationBase, Logger, getDirname } from '@beaver-im/beaver/main'

const logger = new Logger('about')
const require = createRequire(import.meta.url)

class About extends ApplicationBase implements Application {
  constructor() {
    super('about')
  }

  public createBrowserWindow(): BrowserWindow {
    logger.info({ text: 'createBrowserWindow 开始' })
    this.win = new BrowserWindow({
      width: 560,
      height: 720,
      minWidth: 480,
      minHeight: 560,
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
    this.loadAboutRender()
    this.init()
    this.initEvents()
    return this.win
  }

  private loadAboutRender() {
    const html = require.resolve('@beaver-im/app-about/about.html')
    logger.info({ text: '加载包内 about.html', data: { html } })
    this.win.loadFile(html)
  }
}

export default new About()
