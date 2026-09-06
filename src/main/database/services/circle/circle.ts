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

import type { IDBCircle } from 'commonModule/type/database/db/circle'
import { eq, inArray } from 'drizzle-orm'
import { circles } from 'mainModule/database/tables/circle/circles'
import { BaseService } from '../base'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('circle')


class CircleService extends BaseService {
  async upsert(circle: IDBCircle): Promise<void> {
    logger.info({ text: 'upsert 开始' })
    await this.db.insert(circles)
      .values(circle)
      .onConflictDoUpdate({
        target: circles.circleId,
        set: {
          name: circle.name,
          avatar: circle.avatar,
          description: circle.description,
          creatorId: circle.creatorId,
          memberCount: circle.memberCount,
          role: circle.role,
          joinType: circle.joinType,
          version: circle.version,
          updatedAt: circle.updatedAt ?? Math.floor(Date.now() / 1000),
        },
      })
      .run()
  }

  async batchUpsert(items: IDBCircle[]): Promise<void> {
    logger.info({ text: 'batchUpsert 开始' })
    if (!items.length)
      return
    for (const item of items) {
      const local = await this.getCircleById(item.circleId)
      if (!local || (local.version || 0) !== (item.version || 0))
        await this.upsert(item)
    }
  }

  async getCircleById(circleId: string): Promise<IDBCircle | undefined> {
    logger.info({ text: 'getCircleById 开始' })
    return await this.db.select().from(circles).where(eq(circles.circleId as any, circleId as any)).get()
  }

  async getCirclesByIds(circleIds: string[]): Promise<IDBCircle[]> {
    logger.info({ text: 'getCirclesByIds 开始' })
    if (!circleIds.length)
      return []
    return await this.db.select().from(circles).where(inArray(circles.circleId as any, circleIds as any)).all()
  }

  async getCircleList(): Promise<IDBCircle[]> {
    logger.info({ text: 'getCircleList 开始' })
    return await this.db.select().from(circles).all()
  }
}

export default new CircleService()
