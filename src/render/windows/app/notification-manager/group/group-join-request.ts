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
