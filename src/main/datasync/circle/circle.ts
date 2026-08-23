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

import type { ICircleInfoVersionItem } from 'commonModule/type/ajax/datasync'
import { NotificationCircleCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { circleSyncApi } from 'mainModule/api/circle'
import { datasyncGetSyncCircleInfoApi } from 'mainModule/api/datasync'
import dbServiceCircle from 'mainModule/database/services/circle/circle'
import dbServiceDataSync from 'mainModule/database/services/datasync/datasync'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import logger from 'mainModule/utils/log'

class CircleSync {
  async checkAndSync() {
    logger.info({ text: '开始同步圈子资料' })
    try {
      const lastVersion = await dbServiceDataSync.get({ module: 'circles' })
        .then(cursor => cursor?.version || 0)
        .catch(() => 0)

      // 第一阶段：datasync 拿版本摘要
      const serverResponse = await datasyncGetSyncCircleInfoApi({ since: lastVersion })
      const circleVersions = serverResponse.result?.circleVersions || []

      // 对比本地版本，过滤需要更新的圈子
      const needUpdateCircles = await this.compareAndFilterCircleVersions(circleVersions)

      if (needUpdateCircles.length > 0) {
        // 第二阶段：circle 业务接口拉完整资料
        await this.syncCircleData(lastVersion)
      }

      const maxVersion = circleVersions.length > 0
        ? Math.max(...circleVersions.map(item => item.version || 0), lastVersion)
        : lastVersion

      await dbServiceDataSync.upsert({
        module: 'circles',
        version: maxVersion,
        updatedAt: serverResponse.result?.serverTimestamp
          ? Math.floor(serverResponse.result.serverTimestamp / 1000)
          : Math.floor(Date.now() / 1000),
      }).catch(() => {})
    }
    catch (error) {
      logger.error({ text: '圈子资料同步失败', data: { error: (error as any)?.message } })
    }
  }

  private async compareAndFilterCircleVersions(
    circleVersions: ICircleInfoVersionItem[],
  ): Promise<Array<{ circleId: string, version: number }>> {
    if (!circleVersions.length)
      return []

    const circleIds = circleVersions.map(item => item.circleId).filter(Boolean)
    const localCircles = await dbServiceCircle.getCirclesByIds(circleIds)
    const localVersionMap = new Map(localCircles.map(item => [item.circleId, item.version || 0]))

    const needUpdate: Array<{ circleId: string, version: number }> = []
    for (const item of circleVersions) {
      const localVersion = localVersionMap.get(item.circleId) || 0
      if (localVersion < item.version) {
        needUpdate.push({
          circleId: item.circleId,
          version: localVersion,
        })
      }
    }
    return needUpdate
  }

  private async syncCircleData(lastVersion: number) {
    const response = await circleSyncApi({ version: lastVersion })
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

export default new CircleSync()
