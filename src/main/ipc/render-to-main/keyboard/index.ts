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

import type { KeyboardActionId } from 'commonModule/type/mainStore'
import { KeyboardCommand } from 'commonModule/type/ipc/command'
import { getScreenshots } from 'mainModule/utils/capture'
import Logger from 'mainModule/utils/logger'
import { BrowserWindow, globalShortcut } from 'electron'

const logger = new Logger('KeyboardHandler')

function toElectronAccelerator(binding: string): string {
  return binding
    .split('+')
    .map(part => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (part === 'Ctrl') {
        return 'CommandOrControl'
      }
      if (part === 'Cmd') {
        return 'Command'
      }
      return part
    })
    .join('+')
}

class KeyboardHandler {
  /** actionId → 已注册的 Electron accelerator */
  private registered = new Map<KeyboardActionId, string>()

  set(actionId: KeyboardActionId, binding: string) {
    // 如果是发送消息，则不注册
    if (actionId === 'sendMessage') {
      return
    }
    this.unregister(actionId)

    if (!binding) {
      return
    }
    

    const accelerator = toElectronAccelerator(binding)
    const registered = globalShortcut.register(accelerator, () => {
      this.handleAction(actionId)
    })
    if (!registered) {
      logger.warn({
        text: '键盘快捷键注册失败',
        data: { actionId, binding, accelerator },
      })
      return
    }

    this.registered.set(actionId, accelerator)
  }

  private unregister(actionId: KeyboardActionId) {
    const accelerator = this.registered.get(actionId)
    if (!accelerator) {
      return
    }
    globalShortcut.unregister(accelerator)
    this.registered.delete(actionId)
  }

  private handleAction(actionId: KeyboardActionId) {
    switch (actionId) {
      case 'screenshot':
        getScreenshots().startCapture()
        break
      case 'toggleWindow': {
        const windows = BrowserWindow.getAllWindows().filter(win => !win.isDestroyed())
        if (!windows.length) {
          return
        }
        if (windows.some(win => win.isVisible())) {
          windows.forEach(win => win.hide())
        }
        else {
          windows.forEach(win => win.show())
          windows[0].focus()
        }
        break
      }
      case 'sendMessage':
        break
      default:
        logger.warn({
          text: '未知快捷键动作',
          data: { actionId },
        })
    }
  }

  handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: KeyboardCommand | string,
    data?: { actionId?: KeyboardActionId, binding?: string },
  ): void {
    if (command !== KeyboardCommand.SET || !data?.actionId || data.binding === undefined) {
      return
    }
    this.set(data.actionId, data.binding)
  }
}

export default new KeyboardHandler()
