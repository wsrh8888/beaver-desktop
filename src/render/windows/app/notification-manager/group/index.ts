import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationGroupCommand } from 'commonModule/type/preload/notification'
import { NotificationModule } from 'commonModule/type/preload/notification'

// 导入群组模块的通知处理器
import groupNotificationManager from './group'
import groupMemberNotificationManager from './group-member'
import groupJoinRequestNotificationManager from './group-join-request'

/**
 * @description: 群组模块通知路由器
 */
class GroupNotificationRouter {
  /**
   * 处理群组模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.DATABASE_GROUP>) {
    switch (params.command) {
      case NotificationGroupCommand.GROUP_UPDATE:
        await groupNotificationManager.processGroupUpdate(params.data)
        break
      case NotificationGroupCommand.GROUP_MEMBER_UPDATE:
        await groupMemberNotificationManager.processGroupMemberUpdate(params.data)
        break
      case NotificationGroupCommand.GROUP_VALID_UPDATE:
        await groupJoinRequestNotificationManager.processGroupJoinRequestUpdate(params.data)
        break
      default:
        console.warn('未知的群组通知命令:', params.command)
    }
  }
}

export const groupNotificationRouter = new GroupNotificationRouter()