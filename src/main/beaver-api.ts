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
import { bindMain } from '@beaver-im/beaver/main'
import type { IStore } from '@beaver-im/beaver/common/type/mainStore'
import type { AjaxFn } from '@beaver-im/beaver/common/type/ajax'
import { getBaseUrl } from 'commonModule/config'
import { __dirname } from 'mainModule/config'
import { getDb } from 'mainModule/database/db-accessor'
import dataSyncCursorService from 'mainModule/database/services/datasync/datasync'
import { sendMainNotification as hostSendMainNotification } from 'mainModule/ipc/main-to-render'
import { store } from 'mainModule/store'
import Log from 'mainModule/utils/log'
import ajax from 'mainModule/utils/request/request'

export function bindBeaverMainApi(): void {
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
      getBaseUrl,
      getCustom: () => ({
        env: process.custom.ENV,
        tools: process.custom.TOOLS,
        deviceId: process.custom.DEVICE_ID,
        version: process.custom.VERSION,
        platform: process.custom.PLATFORM,
      }),
    },
    database: {
      getDb,
      dataSyncCursor: {
        get: req => dataSyncCursorService.get(req),
        upsert: req => dataSyncCursorService.upsert(req),
      },
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
