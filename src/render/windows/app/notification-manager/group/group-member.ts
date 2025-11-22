import Logger from 'renderModule/utils/logger'
import { useGroupMemberStore } from '../../pinia/group/group-member'

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
