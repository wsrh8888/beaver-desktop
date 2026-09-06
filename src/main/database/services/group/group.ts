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

import type { IDBGroup } from 'commonModule/type/database/db/group'
import { eq, inArray } from 'drizzle-orm'
import { BaseService } from '../base'
import { groups } from 'mainModule/database/tables/group/groups'

import type {
import Logger from 'mainModule/utils/logger';
const logger = new Logger('group')

  DBCreateGroupReq,
  DBUpsertGroupReq,
  DBGetGroupReq,
  DBGetGroupRes,
  DBUpdateGroupReq,
  DBDeleteGroupReq,
  DBGetUserGroupsReq,
  DBGetUserGroupsRes,
  DBBatchCreateGroupsReq,
  DBBatchUpsertGroupsReq,
} from 'commonModule/type/database/server/group/group'

// 群组服务
class GroupService extends BaseService {
  /**
   * @description 创建群组
   */
  async create(req: DBCreateGroupReq): Promise<void> {
    logger.info({ text: 'create 开始' })
    await this.db.insert(groups).values(req).run()
  }

  /**
   * @description 创建或更新群组（upsert操作）
   */
  async upsert(req: DBUpsertGroupReq): Promise<void> {
    logger.info({ text: 'upsert 开始' })
    await this.db.insert(groups)
      .values(req)
      .onConflictDoUpdate({
        target: groups.groupId,
        set: {
          title: req.title,
          avatar: req.avatar,
          creatorId: req.creatorId,
          notice: req.notice,
          joinType: req.joinType,
          status: req.status,
          version: req.version,
          updatedAt: req.updatedAt,
        },
      })
      .run()
  }

  /**
   * @description 批量创建群组（支持插入或更新）
   */
  async batchCreate(req: DBBatchCreateGroupsReq): Promise<void> {
    logger.info({ text: 'batchCreate 开始' })
    if (req.groups.length === 0)
      return

    // 使用插入或更新的方式来避免唯一约束冲突
    for (const group of req.groups) {
      await this.db
        .insert(groups)
        .values(group)
        .onConflictDoUpdate({
          target: groups.groupId,
          set: {
            title: group.title,
            avatar: group.avatar,
            creatorId: group.creatorId,
            notice: group.notice,
            joinType: group.joinType,
            status: group.status,
            updatedAt: group.updatedAt,
          },
        })
        .run()
    }
  }

  /**
   * @description 批量插入或更新群组（基于版本号判断是否需要更新）
   */
  async batchUpsert(req: DBBatchUpsertGroupsReq): Promise<void> {
    logger.info({ text: 'batchUpsert 开始' })
    if (req.groups.length === 0)
      return

    for (const group of req.groups) {
      // 获取本地群组数据
      const localGroup = await this.getGroupById(group.groupId)

      // 如果本地不存在或版本号不同，则更新
      if (!localGroup || localGroup.version !== group.version) {
        await this.db
          .insert(groups)
          .values(group)
          .onConflictDoUpdate({
            target: groups.groupId,
            set: {
              title: group.title,
              avatar: group.avatar,
              creatorId: group.creatorId,
              notice: group.notice,
              joinType: group.joinType,
              status: group.status,
              version: group.version, // 也要更新版本号
              updatedAt: group.updatedAt,
            },
          })
          .run()
      }
    }
  }

  /**
   * @description 根据群组ID获取群组信息
   */
  async getGroupById(groupId: string): Promise<IDBGroup | undefined> {
    logger.info({ text: 'getGroupById 开始' })
    return await this.db.select().from(groups).where(eq(groups.groupId as any, groupId as any)).get()
  }

  /**
   * @description 根据群组ID列表批量获取群组信息
   */
  async getGroupsByIds(groupIds: string[]): Promise<IDBGroup[]> {
    logger.info({ text: 'getGroupsByIds 开始' })
    if (groupIds.length === 0)
      return []
    return await this.db.select().from(groups).where(inArray(groups.groupId as any, groupIds as any)).all()
  }

  /**
   * @description 更新群组信息
   */
  async updateGroup(groupId: string, updateData: any): Promise<any> {
    logger.info({ text: 'updateGroup 开始' })
    updateData.updatedAt = Math.floor(Date.now() / 1000)
    return await this.db.update(groups).set(updateData).where(eq(groups.groupId as any, groupId as any)).run()
  }

  /**
   * @description 删除群组
   */
  async deleteGroup(groupId: string): Promise<any> {
    logger.info({ text: 'deleteGroup 开始' })
    return await this.db.delete(groups).where(eq(groups.groupId as any, groupId as any)).run()
  }
}

export default new GroupService()