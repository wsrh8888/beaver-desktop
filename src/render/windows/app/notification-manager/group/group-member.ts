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
import { useGroupMemberStore } from '../../pinia/group/group-member'
import { useGroupStore } from '../../pinia/group/group'

const logger = new Logger('DatabaseGroupMemberEventManager')

class DatabaseGroupMemberEventManager {
  /**
   * 处理群成员表更新通知
   */
  async processGroupMemberUpdate(data: any) {
    logger.info({
      text: '收到群成员表更新通知',
      data,
    })

    try {
      const groupMemberStore = useGroupMemberStore()

      // 处理推送的数据格式
      if (data?.updatedMembers && Array.isArray(data.updatedMembers)) {
        // 获取涉及的群组ID
        const groupIds = [...new Set((data.updatedMembers || []).map((member: any) => member.groupId as string))]

        // 调用group-member store的方法来批量更新群成员信息
        const updatedGroupIds = await groupMemberStore.updateMembersByGroupIds(groupIds as string[])

        await useGroupStore().updateGroupsByIds(groupIds as string[])

        logger.info({
          text: `群成员表更新处理完成，重新加载了 ${updatedGroupIds?.length || 0} 个群组的成员信息`,
          data: { updatedMembers: data.updatedMembers, updatedGroupIds },
        })
      }
      else {
        console.warn('群成员信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理群成员表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseGroupMemberEventManager()
