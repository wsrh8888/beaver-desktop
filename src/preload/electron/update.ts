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

import type { IDownloadOptions, IUpdateModule } from 'commonModule/type/preload/update'
import { UpdateCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

// --- Update Module ---
export const updateModule: IUpdateModule = {
  // 保存之前的监听器引用
  previousHandler: null as any,

  // 下载更新，传入下载参数对象和进度回调
  downloadUpdate: (options: IDownloadOptions, onProgress: (progress: number) => void) => {
    // 先移除之前的监听器
    if (updateModule.previousHandler) {
      ipcRenderManager.removeListener(UpdateCommand.DOWNLOAD_PROGRESS, updateModule.previousHandler)
    }

    // 创建新的进度处理函数
    const progressHandler = (_: any, progress: number) => {
      onProgress(progress)

      // 进度100%或异常时自动移除监听器
      if (progress >= 100 || progress < 0) {
        ipcRenderManager.removeListener(UpdateCommand.DOWNLOAD_PROGRESS, progressHandler)
        updateModule.previousHandler = null
      }
    }

    // 保存新的监听器引用
    updateModule.previousHandler = progressHandler

    // 注册新的进度回调
    ipcRenderManager.on(UpdateCommand.DOWNLOAD_PROGRESS, progressHandler)

    // 开始下载，传递options参数（fileKey作为下载地址）
    ipcRenderManager.send(IEvent.RenderToMain, UpdateCommand.DOWNLOAD_UPDATE, options)
  },

  // 触发升级
  startUpdate: (options: IDownloadOptions) => {
    ipcRenderManager.send(IEvent.RenderToMain, UpdateCommand.START_UPDATE, options)
  },
}
