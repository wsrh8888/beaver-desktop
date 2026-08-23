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

import { NotificationAppLifecycleCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'
import { chatDatasync } from './chat'
import { circleDatasync } from './circle'
import { emojiDatasync } from './emoji'
import { friendDatasync } from './friend'
import { groupDatasync } from './group'
import { notificationDatasync } from './notification'
import { userDatasync } from './user'

// 数据同步管理器
class DataSyncManager {
  private isSyncing = false

  constructor() {
    // 不需要初始化，直接使用导出的实例
  }

  // 获取当前同步状态
  getStatus() {
    return this.isSyncing ? 'syncing' : 'idle'
  }

  // 自动同步
  async autoSync() {
    logger.info({ text: '开始自动同步' }, 'DataSyncManager')

    try {
      this.isSyncing = true
      sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
        status: 'syncing',
        timestamp: Date.now(),
      })
      await userDatasync.checkAndSync()
      await chatDatasync.checkAndSync()
      await friendDatasync.checkAndSync()
      await groupDatasync.checkAndSync()
      await circleDatasync.checkAndSync()
      await emojiDatasync.checkAndSync()
      await notificationDatasync.checkAndSync()

      this.isSyncing = false
      // 通知前端：同步完成，系统就绪
      sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
        status: 'ready',
      })

      logger.info({ text: '数据同步完成' }, 'DataSyncManager')
    }
    catch {
      this.isSyncing = false
      sendMainNotification('*', NotificationModule.APP_LIFECYCLE, NotificationAppLifecycleCommand.STATUS_CHANGE, {
        status: 'sync_error',
      })
    }
  }
}

// 导出数据同步管理器实例
export const dataSyncManager = new DataSyncManager()
