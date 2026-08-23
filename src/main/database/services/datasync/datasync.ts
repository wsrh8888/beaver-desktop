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

import { eq } from 'drizzle-orm'
import { BaseService } from '../base'
import { datasync } from '../../tables/datasync/datasync'
import type {
  DBGetSyncCursorReq,
  DBGetSyncCursorRes,
  DBGetByDataTypeReq,
  DBGetByDataTypeRes,
  DBUpsertSyncCursorReq,
  DBUpsertByDataTypeReq,
} from 'commonModule/type/database/server/datasync/datasync'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('datasync')

// 同步游标服务
class DataSync extends BaseService {
  /**
   * @description 获取同步游标 (新接口)
   */
  async get(req: DBGetSyncCursorReq): Promise<DBGetSyncCursorRes> {
    try {
    const cursor = await this.db.select().from(datasync).where(
      eq(datasync.module as any, req.module),
    ).get()
    return cursor
    }
    catch (error) {
      logger.error({ text: '获取同步游标失败 get', data: { error: (error as any)?.message } })
      return undefined
    }
  }

  /**
   * @description 获取同步游标 (旧接口，向后兼容)
   */
  async getByDataType(req: DBGetByDataTypeReq): Promise<DBGetByDataTypeRes> {
    try {
      return await this.get({ module: req.dataType })
    }
    catch (error) {
      logger.error({ text: '获取同步游标失败', data: { error: (error as any)?.message } })
      return undefined
    }
  }

  /**
   * @description 创建或更新同步游标 (新接口)
   */
  async upsert(req: DBUpsertSyncCursorReq): Promise<void> {
    try {
    const existing = await this.get({ module: req.module })

    if (existing) {
      await this.db.update(datasync)
        .set({
          version: req.version,
          updatedAt: req.updatedAt,
        })
        .where(eq(datasync.id as any, existing.id!))
        .run()
    }
    else {
      await this.db.insert(datasync).values(req).run()
    }
    }
    catch (error) {
      logger.error({ text: '创建或更新同步游标失败', data: { error: (error as any)?.message } })
    }
  }

  /**
   * @description 创建或更新同步游标 (旧接口，向后兼容)
   */
  async upsertByDataType(req: DBUpsertByDataTypeReq): Promise<void> {
    return this.upsert({
      module: req.dataType,
      version: req.lastSeq,
    })
  }
}

// 导出数据同步服务实例
export default new DataSync()
