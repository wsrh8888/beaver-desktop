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
import { useCircleStore } from '../../pinia/circle/circle'

const logger = new Logger('DatabaseCircleEventManager')

class DatabaseCircleEventManager {
  /**
   * 处理圈子资料更新通知
   */
  async processCircleUpdate(data: any) {
    logger.info({
      text: '收到圈子资料更新通知',
      data,
    })

    try {
      const circleStore = useCircleStore()

      if (data?.updatedCircles && Array.isArray(data.updatedCircles)) {
        const circleIds = data.updatedCircles.map((item: any) => item.circleId).filter(Boolean)
        await circleStore.updateCirclesByIds(circleIds)

        logger.info({
          text: `圈子资料更新成功: count=${circleIds.length}`,
          data: { updatedCircles: data.updatedCircles },
        })
      }
      else {
        // 无明细时全量刷新本地圈子列表
        await circleStore.init()
      }
    }
    catch (error) {
      logger.error({
        text: '处理圈子资料更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseCircleEventManager()
