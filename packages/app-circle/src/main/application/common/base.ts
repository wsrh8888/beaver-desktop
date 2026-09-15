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
import path from 'node:path'
import { Logger, getCustom, getDirname, store } from '@beaver-im/beaver/main'

const logger = new Logger('ApplicationBase')

export default class ApplicationBase {
  protected win!: BrowserWindow
  protected name: string

  constructor(name: string) {
    this.name = name
  }

  protected loadRender() {
    logger.info({ text: '开始加载渲染页面', data: { name: this.name } })
    // VITE_DEV_SERVER_URL 常带尾斜杠，用 URL 拼接避免变成 //name.html（包内入口会 404）
    if (process.env.VITE_DEV_SERVER_URL) {
      this.win.loadURL(new URL(`${this.name}.html`, process.env.VITE_DEV_SERVER_URL).href)
      return
    }
    this.win.loadFile(path.join(getDirname(), `../dist/${this.name}.html`))
  }

  protected loadUrlRender(url: string) {
    this.win.loadURL(url)
  }

  protected init() {
    (this.win as any).__appName = this.name
    if (getCustom().tools) {
      // 延迟打开开发者工具，确保窗口完全加载
      // setTimeout(() => {
      //   this.win.webContents.openDevTools()
      // }, 1000)
    }
  }

  // 初始化事件监听器
  protected initEvents() {

  }

  getPreloadParams() {
    const custom = getCustom()
    return {
      env: custom.env,
      token: store.get('userInfo')?.token,
      devicedId: custom.deviceId,
      version: custom.version,
    }
  }
}
