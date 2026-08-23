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
import { useFriendVerifyStore } from '../../pinia/friend/friend_verify'

const logger = new Logger('DatabaseFriendVerifyEventManager')

class DatabaseFriendVerifyEventManager {
  /**
   * 处理好友验证表更新通知
   */
  async processFriendVerifyUpdate(data: any) {
    logger.info({
      text: '收到好友验证表更新通知',
      data,
    })

    try {
      const friendVerifyStore = useFriendVerifyStore()

      // 处理推送的数据格式
      if (data?.updatedVerifies && Array.isArray(data.updatedVerifies)) {
        // 使用用户ID列表更新好友验证数据
        const fetchedVerifies = await friendVerifyStore.updateVerifiesByUserIds(data.updatedVerifies)

        logger.info({
          text: `好友验证表更新处理完成，根据用户ID列表更新了 ${fetchedVerifies?.length || 0} 个验证记录`,
          data: { updatedVerifies: data.updatedVerifies, fetchedVerifies },
        })
      }
      else {
        console.warn('好友验证信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理好友验证表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseFriendVerifyEventManager()
