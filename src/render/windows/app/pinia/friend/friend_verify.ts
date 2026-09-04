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

import type { IValidInfo } from 'commonModule/type/ajax/friend'
import { defineStore } from 'pinia'
import Logger from 'renderModule/utils/logger'
import { getValidListApi } from 'renderModule/api/friend'
import { useContactStore } from '../contact/contact'

const logger = new Logger('FriendVerifyStore')
/**
 * @description: 好友信息管理
 */
export const useFriendVerifyStore = defineStore('friendVerifyStore', {
  state: (): {
    friendVerifyList: IValidInfo[]
  } => ({
    /**
     * @description: 好友验证列表
     */
    friendVerifyList: [],
  }),

  getters: {
    // 获取验证列表. user基础信息从contact 获取

    /**
     * @description: 获取增强后的验证列表（包含联系人信息）
     */
    getVerifyList: (state) => {
      const contactStore = useContactStore()

      return state.friendVerifyList.map((item) => {
        // 从contactStore获取最新的联系人信息
        const contactInfo = contactStore.getContact(item.userId)
        if (contactInfo) {
          // 返回增强后的验证信息
          return {
            ...item,
            nickName: contactInfo.nickName || item.nickName,
            avatar: contactInfo.avatar || item.avatar,
          }
        }
        return item
      })
    },
  },

  actions: {

    async init() {
      const res = await getValidListApi({
        page: 1,
        limit: 1000,
      })
      this.friendVerifyList = res.result.list || []
    },

    /**
     * @description: 根据用户ID列表更新好友验证数据
     */
    async updateVerifiesByUserIds(updatedVerifies: Array<{ verifyId: string, version: number }>) {
      if (updatedVerifies.length === 0) {
        return
      }

      try {
        // 提取用户ID列表
        const verifyIds = updatedVerifies.map(v => v.verifyId)

        // 使用验证记录ID列表查询获取最新的验证数据
        const result = await electron.database.friend.getValidByIds({
          verifyIds,
        })

        // 更新friend verify store
        for (const verify of result.list) {
          const index = this.friendVerifyList.findIndex(v => v.userId === verify.userId)
          if (index !== -1) {
            this.friendVerifyList[index] = verify
          }
          else {
            this.friendVerifyList.push(verify)
          }
        }

        return result.list
      }
      catch (error) {
        logger.error({ text: '根据用户ID列表更新好友验证信息失败', data: { error: (error as Error)?.message } })
        throw error
      }
    },
  },
})
