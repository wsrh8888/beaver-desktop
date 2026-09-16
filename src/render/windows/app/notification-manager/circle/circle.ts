/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import Logger from 'renderModule/utils/logger'
import { useCircleStore } from '../../pinia/circle/circle'

const logger = new Logger('DatabaseCircleEventManager')

class DatabaseCircleEventManager {
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
