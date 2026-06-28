import Logger from 'renderModule/utils/logger'
import { useGroupStore } from '../../pinia/group/group'

const logger = new Logger('DatabaseGroupEventManager')

class DatabaseGroupEventManager {
  /**
   * 处理群组表更新通知
   */
  async processGroupUpdate(data: any) {
    logger.info({
      text: '收到群组表更新通知',
      data,
    })

    try {
      const groupStore = useGroupStore()

      // 处理推送的数据格式
      if (data?.updatedGroups && Array.isArray(data.updatedGroups)) {
        const groupIds = data.updatedGroups.map((group: any) => group.groupId)
        const updatedGroups = await groupStore.updateGroupsByIds(groupIds)

        logger.info({
          text: `群组信息更新成功: count=${updatedGroups?.length || 0}`,
          data: { updatedGroups: data.updatedGroups, fetchedGroups: updatedGroups },
        })
      }
      else {
        console.warn('群组信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理群组表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseGroupEventManager()
