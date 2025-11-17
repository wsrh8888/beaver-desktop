import { GroupReceiver } from './group'
import { GroupJoinRequestReceiver } from './group-join-request-receiver'
import { GroupMemberReceiver } from './group-member-receiver'

/**
 * @description: 群组消息路由器
 * 根据消息类型路由到对应的接收器
 */
export class GroupMessageRouter {
  private groupReceiver = new GroupReceiver()
  private groupJoinRequestReceiver = new GroupJoinRequestReceiver()
  private groupMemberReceiver = new GroupMemberReceiver()

  /**
   * 处理群组消息
   * @param wsMessage WebSocket 消息内容
   */
  async processGroupMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      console.warn('群组消息缺少 type 字段', wsMessage)
      return
    }

    switch (data.type) {
      // 群组信息同步
      case 'group_receive':
        await this.groupReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 群成员添加请求
      case 'group_join_request_receive':
        await this.groupJoinRequestReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 群成员变动
      case 'group_member_receive':
        await this.groupMemberReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        console.warn('未知的群组消息类型', data.type)
    }
  }
}

// 导出单例实例
export const groupMessageRouter = new GroupMessageRouter()
