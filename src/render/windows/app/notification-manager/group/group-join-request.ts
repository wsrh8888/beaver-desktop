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
import { useGroupJoinRequestStore } from '../../pinia/group/group-join-request'

const logger = new Logger('DatabaseGroupJoinRequestEventManager')

class DatabaseGroupJoinRequestEventManager {
  /**
   * 处理群加入请求表更新通知
   */
  async processGroupJoinRequestUpdate(data: any) {
    const { syncedRequests } = data

    logger.info({
      text: `收到群加入请求表更新通知，${syncedRequests?.length || 0} 个请求`,
      data: { syncedRequests },
    })

    try {
      const groupJoinRequestStore = useGroupJoinRequestStore()

      // 群加入请求数据更新，刷新申请列表
      await groupJoinRequestStore.refresh()

      logger.info({
        text: `群加入请求表更新处理完成，重新加载了申请列表`,
        data: { syncedRequests },
      })
    }
    catch (error) {
      logger.error({
        text: '处理群加入请求表更新失败',
        data: { syncedRequests, error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseGroupJoinRequestEventManager()
