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
