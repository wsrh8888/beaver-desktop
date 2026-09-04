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

import { WorkbenchCommand } from 'commonModule/type/ipc/command'
import { BrowserWindow, shell } from 'electron'
import workbenchWebContentsView from 'mainModule/web-contents-view/workbench/workbench'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('WorkbenchHandler')

class WorkbenchHandler {
  handle(
    event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: WorkbenchCommand | string,
    data: any,
  ) {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win)
      return

    switch (command) {
      case WorkbenchCommand.EMBED_OPEN:
        workbenchWebContentsView.open(win, data?.tabId, data?.url, data?.bounds)
        break
      case WorkbenchCommand.EMBED_HIDE_ALL:
        workbenchWebContentsView.hideAll(win)
        break
      case WorkbenchCommand.EMBED_SET_BOUNDS:
        workbenchWebContentsView.setBounds(win, data?.tabId, data?.bounds)
        break
      case WorkbenchCommand.EMBED_RELOAD:
        workbenchWebContentsView.reload(win, data?.tabId)
        break
      case WorkbenchCommand.EMBED_CLOSE:
        workbenchWebContentsView.closeTab(win, data?.tabId)
        break
      case WorkbenchCommand.OPEN_EXTERNAL: {
        const url = typeof data?.url === 'string' ? data.url.trim() : ''
        if (!url || !/^https?:\/\//i.test(url)) {
          logger.error({ text: `工作台外开地址不合法: ${url}` })
          break
        }
        void shell.openExternal(url)
        break
      }
      default:
        logger.error({ text: `工作台处理未知命令: ${command}` })
        break
    }
  }
}

export default new WorkbenchHandler()
