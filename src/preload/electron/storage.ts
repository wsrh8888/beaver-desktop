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

import type { IStoreOptions } from 'commonModule/type/mainStore'
import type { IStorageModule } from 'commonModule/type/preload/storage'
import { StorageCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const storageModule: IStorageModule = {
  getAsync: (key: string, options?: IStoreOptions) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, StorageCommand.GET, { key, options })
  },
  setAsync: (key: string, value: any, options?: IStoreOptions) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, StorageCommand.SET, { key, value, options })
  },
  removeAsync: (key: string) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, StorageCommand.REMOVE, { key })
  },
}
