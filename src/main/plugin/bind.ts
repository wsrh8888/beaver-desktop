/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 将宿主真实实现绑定到 @beaver-im/beaver 官方 API。
 * 必须在任何插件使用 beaver API 之前调用。
 * 结构对齐 preload 的 electronAPI 模块树。
 */
import { bindMain, setKeyboardBindingHandler } from '@beaver-im/beaver/main'
import type { IStore } from '@beaver-im/beaver'
import type { AjaxFn } from '@beaver-im/beaver'
import { __dirname } from 'mainModule/config'
import { getDb } from 'mainModule/database/bind'
import { sendMainNotification as hostSendMainNotification } from 'mainModule/ipc/main-to-render'
import keyboardHandler from 'mainModule/ipc/render-to-main/keyboard'
import { store } from 'mainModule/store'
import Log from 'mainModule/utils/log'
import ajax from 'mainModule/utils/request/request'

export function bindBeaverMain(): void {
  // 注入键盘快捷键注册实现（宿主 keyboard handler 是真正实现，属宿主平台关注点）
  setKeyboardBindingHandler((actionId, binding) =>
    keyboardHandler.set(actionId as any, binding),
  )

  bindMain({
    logger: {
      send: (level, msg, logName) => {
        Log[level](msg, logName, 'main')
      },
    },
    // 宿主 store 键更多；插件契约只认对外子集
    store: store as unknown as IStore,
    config: {
      dirname: __dirname,
      getCustom: () => ({
        env: process.custom.ENV,
        tools: process.custom.TOOLS,
        deviceId: process.custom.DEVICE_ID,
        version: process.custom.VERSION,
        platform: process.custom.PLATFORM,
        ...(process.custom.BASE_URL ? { baseUrl: process.custom.BASE_URL } : {}),
      }),
    },
    database: {
      getDb,
    },
    request: {
      ajax: ajax as AjaxFn,
    },
    ipc: {
      sendMainNotification: (targetName, module, command, payload) => {
        hostSendMainNotification(targetName, module as any, command as any, payload)
      },
    },
  })
}
