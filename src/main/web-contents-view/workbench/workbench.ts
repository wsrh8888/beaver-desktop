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
import type { EmbedViewLoadState, IEmbedViewBounds } from 'commonModule/type/main/embed-view'
import { WORKBENCH_EMBED_STATE_CHANNEL } from 'commonModule/type/main/web-contents-view/workbench'
import path from 'node:path'
import { WebContentsView } from 'electron'
import bridgeRegistry from 'mainModule/bridge/registry'
import { __dirname } from 'mainModule/config'

interface IWorkbenchViewOwner {
  win: BrowserWindow
  tabId: string
  view: WebContentsView
}

/** 工作台内嵌 WebContentsView，只管理 tabId → 实例，显示哪个 Tab 由渲染层决定 */
class WorkbenchWebContentsView {
  private views = new Map<string, IWorkbenchViewOwner>()

  open(win: BrowserWindow, tabId: string, url: string, bounds: IEmbedViewBounds) {
    if (this.views.has(tabId))
      this.show(win, tabId, bounds)
    else
      this.create(win, tabId, url, bounds)
  }

  show(win: BrowserWindow, tabId: string, bounds: IEmbedViewBounds) {
    this.detachAll(win)
    const owner = this.views.get(tabId)!
    win.contentView.addChildView(owner.view)
    owner.view.setBounds(this.toBounds(bounds))
  }

  hideAll(win: BrowserWindow) {
    this.detachAll(win)
  }

  setBounds(_win: BrowserWindow, tabId: string, bounds: IEmbedViewBounds) {
    this.views.get(tabId)?.view.setBounds(this.toBounds(bounds))
  }

  reload(_win: BrowserWindow, tabId: string) {
    this.views.get(tabId)?.view.webContents.reload()
  }

  closeTab(win: BrowserWindow, tabId: string) {
    const owner = this.views.get(tabId)
    if (!owner)
      return

    this.removeFromWindow(win, owner.view)
    bridgeRegistry.unregister(owner.view.webContents.id)
    owner.view.webContents.close()
    this.views.delete(tabId)
  }

  detachWindow(win: BrowserWindow) {
    ;[...this.views.keys()].forEach(tabId => this.closeTab(win, tabId))
  }

  private create(win: BrowserWindow, tabId: string, url: string, bounds: IEmbedViewBounds) {
    const view = new WebContentsView({
      webPreferences: {
        preload: path.join(__dirname, './preload/bridge.mjs'),
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: true,
      },
    })
    view.setBackgroundColor('#FFFFFF')
    this.views.set(tabId, { win, tabId, view })
    bridgeRegistry.register(view.webContents.id, {
      host: 'workbench',
      tabId,
      win,
    })
    this.bindLoadEvents(win, tabId, view)
    // 拦截 target=_blank / window.open，避免额外弹出 BrowserWindow（百度等站常见）
    view.webContents.setWindowOpenHandler(({ url: nextUrl }) => {
      if (nextUrl)
        view.webContents.loadURL(nextUrl)
      return { action: 'deny' }
    })
    view.webContents.loadURL(url)
    this.show(win, tabId, bounds)
  }

  private detachAll(win: BrowserWindow) {
    this.views.forEach(owner => this.removeFromWindow(win, owner.view))
  }

  private removeFromWindow(win: BrowserWindow, view: WebContentsView) {
    if (win.isDestroyed())
      return
    if (win.contentView.children.includes(view))
      win.contentView.removeChildView(view)
  }

  private toBounds(bounds: IEmbedViewBounds) {
    return {
      x: Math.round(bounds.x),
      y: Math.round(bounds.y),
      width: Math.round(bounds.width),
      height: Math.round(bounds.height),
    }
  }

  private sendLoadState(win: BrowserWindow, tabId: string, state: EmbedViewLoadState) {
    if (win.isDestroyed())
      return
    win.webContents.send(WORKBENCH_EMBED_STATE_CHANNEL, { tabId, state })
  }

  private bindLoadEvents(win: BrowserWindow, tabId: string, view: WebContentsView) {
    const { webContents } = view
    webContents.on('did-start-loading', () => this.sendLoadState(win, tabId, 'loading'))
    webContents.on('did-stop-loading', () => this.sendLoadState(win, tabId, 'loaded'))
    webContents.on('did-fail-load', (_event, errorCode) => {
      if (errorCode !== -3)
        this.sendLoadState(win, tabId, 'failed')
    })
  }
}

export default new WorkbenchWebContentsView()
