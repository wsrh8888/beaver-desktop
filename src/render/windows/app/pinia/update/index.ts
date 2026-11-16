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

import type { IGetLatestVersionRes } from 'commonModule/type/ajax/update'
import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'
import { getLatestVersionApi } from 'renderModule/api/update'

const logger = new Logger('UpdateStore')

/**
 * @description: 更新状态管理
 * 简化的更新检查，只需要知道是否有更新
 */
export const useUpdateStore = defineStore('update', {
  state: () => ({
    updateInfo: {} as IGetLatestVersionRes,

  }),

  actions: {
    /**
     * @description: 初始化更新检查（应用启动时调用）
     */
    async init() {
      try {
        await this.checkUpdate()
      }
      catch (error) {
        logger.warn({ text: '初始化更新检查失败', data: { error: (error as Error)?.message } })
      }
    },

    /**
     * @description: 检查更新
     */
    async checkUpdate() {
      try {
        const response = await getLatestVersionApi({
          appId: '87c9dc499cc34f32896a4537e66cf65e',
          platformId: 1,
          archId: 1,
        })

        if (response.code === 0) {
          this.updateInfo = response.result
        }
      }
      catch (error) {
        logger.error({ text: '检查更新异常', data: { error: (error as Error)?.message } })
      }
    },

    /**
     * @description: 开始更新（打开更新窗口）
     */
    async startUpdate() {
      logger.info({ text: '开始更新，打开更新窗口', data: { hasUpdate: this.updateInfo?.hasUpdate } })
      // 通过IPC通知主进程打开更新窗口
      await electron.window?.openWindow('updater', {
        params: {
          hasUpdate: this.updateInfo.hasUpdate,
          forceUpdate: this.updateInfo.forceUpdate,
          version: this.updateInfo.version,
          fileUrl: this.updateInfo.fileUrl,
          size: this.updateInfo.size,
          md5: this.updateInfo.md5,
          description: this.updateInfo.description,
          releaseNotes: this.updateInfo.releaseNotes,
        },
      })
    },
  },
})
