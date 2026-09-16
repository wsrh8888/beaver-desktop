/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { BrowserWindow } from 'electron'
import path from 'node:path'
import Logger from '../utils/logger'
import { getCustom, getDirname } from '../config'
import { store } from '../store'

const logger = new Logger('ApplicationBase')

/**
 * 官方能力包 / 宿主窗口的公共基类（loadRender、preload 参数等）。
 * 依赖 bindMain 后的 getDirname / getCustom / store。
 */
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
    ;(this.win as any).__appName = this.name
    if (getCustom().tools) {
      // 延迟打开开发者工具，确保窗口完全加载
    }
  }

  protected initEvents() {}

  getPreloadParams() {
    const custom = getCustom()
    return {
      env: custom.env,
      token: store.get('userInfo')?.token,
      devicedId: custom.deviceId,
      version: custom.version,
      // 仅透传 config.ini 覆盖；默认域名由 common 按 env 解析
      ...(custom.baseUrl ? { baseUrl: custom.baseUrl } : {}),
    }
  }
}
