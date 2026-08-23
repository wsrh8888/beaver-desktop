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

import { NotificationCircleCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { circleSyncApi } from 'mainModule/api/circle'
import dbServiceCircle from 'mainModule/database/services/circle/circle'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'

class CircleBusiness {
  async getCircleList() {
    return dbServiceCircle.getCircleList()
  }

  /**
   * WS 推送圈子资料变更后，按本地版本增量拉取并通知渲染进程刷新
   */
  async handleTableUpdates(circleId: string, version: number) {
    if (!circleId)
      return

    const local = await dbServiceCircle.getCircleById(circleId)
    const localVersion = local?.version || 0
    if (localVersion >= version)
      return

    const response = await circleSyncApi({ version: localVersion })
    const list = response.result?.list || []
    if (!list.length)
      return

    const localCircles = list.map(item => ({
      circleId: item.circleId,
      name: item.name,
      avatar: item.avatar || '',
      memberCount: item.memberCount || 0,
      role: item.role || 0,
      version: item.version || 0,
    }))
    await dbServiceCircle.batchUpsert(localCircles)

    sendMainNotification('*', NotificationModule.DATABASE_CIRCLE, NotificationCircleCommand.CIRCLE_UPDATE, {
      updatedCircles: localCircles.map(item => ({
        circleId: item.circleId,
        version: item.version,
      })),
    })
  }
}

export default new CircleBusiness()
