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

import type { IUserSettings, KeyboardActionId } from 'commonModule/type/settings'
import { SettingsCommand } from 'commonModule/type/ipc/command'
import { store } from 'mainModule/store'
import { getUserSettingsApi } from 'mainModule/api/user'
import keyboardHandler from 'mainModule/ipc/render-to-main/keyboard'

class SettingsHandler {
  async init() {
    const res = await getUserSettingsApi()
    if (res.code !== 0 || !res.result) {
      return
    }
    this.saveToStore(res.result)
    ;(Object.keys(res.result.keyboard) as KeyboardActionId[]).forEach((actionId) => {
      keyboardHandler.set(actionId, res.result!.keyboard[actionId])
    })
  }

  private saveToStore(settings: IUserSettings) {
    store.set('settings', {
      ...settings,
      keyboard: { ...settings.keyboard },
    }, { persist: true })
  }

  async handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: SettingsCommand | string,
    data?: { settings?: IUserSettings },
  ): Promise<IUserSettings | void> {
    switch (command) {
      case SettingsCommand.SETTINGS_INIT:
        await this.init()
        return void 0
      case SettingsCommand.SETTINGS_GET:
        return store.get('settings')!
      case SettingsCommand.SETTINGS_UPDATE:
        if (!data?.settings) {
          return store.get('settings')!
        }
        this.saveToStore(data.settings)
        return data.settings
      default:
        console.error(`设置处理未知命令: ${command}`)
    }
  }
}

export default new SettingsHandler()
