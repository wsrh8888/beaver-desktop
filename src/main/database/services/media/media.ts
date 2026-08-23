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

import { and, eq } from 'drizzle-orm'
import { BaseService } from '../base'
import { media } from '../../tables/media/media'
import type {
  DBUpsertMediaReq,
  DBGetMediaInfoReq,
  DBGetMediaInfoRes,
  DBDeleteMediaReq,
} from 'commonModule/type/database/server/media/media'

/**
 * 媒体缓存数据库服务
 * 替代之前的JSON索引管理，提供数据库层面的缓存管理
 */
class MediaService extends BaseService {

  /**
   * @description 添加或更新媒体记录
   */
  async upsert(req: DBUpsertMediaReq): Promise<void> {
    const now = Math.floor(Date.now() / 1000)

    const existing = await this.db
      .select()
      .from(media)
      .where(eq(media.url as any, req.url))
      .limit(1)

    if (existing.length > 0) {
      await this.db
        .update(media)
        .set({
          path: req.path,
          size: req.size,
          md5: req.md5,
          updatedAt: now,
          isDeleted: 0,
        })
        .where(eq(media.url as any, req.url))
    }
    else {
      await this.db.insert(media).values({
        url: req.url,
        md5: req.md5,
        path: req.path,
        type: req.type,
        size: req.size,
        createdAt: now,
        updatedAt: now,
        isDeleted: 0,
      })
    }
  }

  /**
   * @description 根据完整 URL 获取媒体缓存信息
   */
  async getMediaInfo(req: DBGetMediaInfoReq): Promise<DBGetMediaInfoRes> {
    const result = await this.db
      .select()
      .from(media)
      .where(and(eq(media.url as any, req.url), eq(media.isDeleted as any, 0)))
      .limit(1)

    if (result.length === 0) {
      return null
    }

    const record = result[0]
    return {
      url: record.url,
      md5: record.md5 || undefined,
      path: record.path,
      type: record.type,
      size: record.size || undefined,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
      isDeleted: record.isDeleted,
    }
  }

  /**
   * @description 标记为删除状态（软删除）
   */
  async deleteMedia(req: DBDeleteMediaReq): Promise<void> {
    await this.db
      .update(media)
      .set({
        isDeleted: 1,
        updatedAt: Math.floor(Date.now() / 1000),
      })
      .where(eq(media.url as any, req.url))
  }
}

export default new MediaService()
