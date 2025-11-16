import { friendVerifyBusiness } from 'mainModule/business/friend/friend-verify'

/**
 * @description: 好友验证接收器 - 处理friend_verify表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
export class FriendVerifyReceiver {

  /**
   * 处理好友验证表更新通知
   * 只处理 friend_verify 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 过滤出只包含 friend_verify 的更新，逐个处理
    const friendVerifyUpdates = tableUpdates.filter((update: any) => update.table === 'friend_verify')

    for (const update of friendVerifyUpdates) {
      // 使用business的队列处理机制，避免频繁请求
      await friendVerifyBusiness.handleTableUpdates(update.userId, update.data[0].uuid, update.data[0].version)
    }
  }
}
