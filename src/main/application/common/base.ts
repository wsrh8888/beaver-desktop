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
import { __dirname } from 'mainModule/config'
import { store } from 'mainModule/store'

export default class ApplicationBase {
  protected win!: BrowserWindow
  protected name: string

  constructor(name: string) {
    this.name = name
  }

  protected loadRender() {
    const url = process.env.VITE_DEV_SERVER_URL
      ? `${process.env.VITE_DEV_SERVER_URL}/${this.name}.html`
      : path.join(__dirname, `../dist/${this.name}.html`)

    this.win.loadURL(url)
  }

  protected loadUrlRender(url: string) {
    this.win.loadURL(url)
  }

  protected init() {
    (this.win as any).__appName = this.name
    if (process.custom.TOOLS) {
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
    return {
      env: process.custom.ENV,
      token: store.get('userInfo')?.token,
      devicedId: process.custom.DEVICE_ID,
      version: process.custom.VERSION,
      ...(process.custom.BASE_URL ? { baseUrl: process.custom.BASE_URL } : {}),
    }
  }
}
