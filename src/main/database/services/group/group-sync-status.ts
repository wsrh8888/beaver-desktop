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

// 群组同步状态服务 - 使用独立的groupSyncStatus表
import { and, eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { groupSyncStatus } from '../../tables/group/sync-status'
import type {
  DBGetModuleVersionsReq,
  DBGetModuleVersionsRes,
  DBUpsertSyncStatusReq,
} from 'commonModule/type/database/server/group/group-sync-status'

import { IDBGroupSyncStatus } from 'commonModule/type/database/db/group'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('group-sync-status')
class GroupSyncStatus extends BaseService {

  /**
   * @description 批量获取指定模块的版本状态
   */
  async getModuleVersions(req: DBGetModuleVersionsReq): Promise<DBGetModuleVersionsRes> {
    try {
    if (req.groupIds.length === 0) {
      return []
    }

    const statuses = await this.db.select()
      .from(groupSyncStatus)
      .where(and(eq(groupSyncStatus.module, req.module), inArray(groupSyncStatus.groupId, req.groupIds)))

    const versions = statuses.map((status: IDBGroupSyncStatus) => ({
      groupId: status.groupId,
      version: status.version || 0,
    }))

    return versions
    }
    catch (error) {
      logger.error({ text: '获取群组版本状态失败', data: { error: (error as any)?.message } })
      return []
    }
  }

  /**
   * @description 更新指定模块的同步状态
   */
  async upsertSyncStatus(req: DBUpsertSyncStatusReq): Promise<void> {
    await this.db
      .insert(groupSyncStatus)
      .values({
        module: req.module,
        groupId: req.groupId,
        version: req.version,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .onConflictDoUpdate({
        target: [groupSyncStatus.groupId, groupSyncStatus.module],
        set: {
          version: req.version,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }
}

export default new GroupSyncStatus()