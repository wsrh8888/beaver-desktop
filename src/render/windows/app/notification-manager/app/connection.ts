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

import Logger from 'renderModule/utils/logger'
import { useAppStore } from '../../pinia/app/app'

const logger = new Logger('应用生命周期通知处理器')

/**
 * @description: 应用生命周期通知处理器
 */
class AppLifecycleNotificationManager {
  /**
   * 处理生命周期状态变更
   */
  async handleLifecycleStatusChange(data: any) {
    logger.info({
      text: '处理应用生命周期状态变更',
      data,
    })

    const appStore = useAppStore()
    const oldStatus = appStore.lifecycleStatus
    appStore.updateLifecycleStatus(data.status)

    // 如果状态从 syncing 变更为 ready，说明全量增量同步已完成，需要重新加载本地 Store 数据
    if (data.status === 'ready' && oldStatus === 'syncing') {
      logger.info({ text: '同步完成，开始从本地数据库刷新 Store 数据' })
      await appStore.loadAllStoreData()
    }
  }
}

export default new AppLifecycleNotificationManager()
