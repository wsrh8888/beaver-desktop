import { friendBusiness } from 'mainModule/business/friend/friend'
import { friendVerifyBusiness } from 'mainModule/business/friend/friend-verify'
import { userBusiness } from 'mainModule/business/user/user'

/**
 * @description: 好友验证接收器 - 处理friend_verify表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
class FriendVerifyReceiver {
  /**
   * 处理好友验证表更新通知
   * 处理 friend_verify 表和 users 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 过滤出 friend_verify 的更新
    const friendVerifyUpdates = tableUpdates.filter((update: any) => update.table === 'friend_verify')

    // 过滤出 friends 的更新
    const friendUpdates = tableUpdates.filter((update: any) => update.table === 'friends')

    // 过滤出 users 的更新
    const userUpdates = tableUpdates.filter((update: any) => update.table === 'users')

    // 处理好友验证更新
    for (const update of friendVerifyUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用business的队列处理机制，避免频繁请求
        await friendVerifyBusiness.handleTableUpdates(dataItem.userId, dataItem.verifyId, dataItem.version)
      }
    }

    // 处理好友关系更新
    for (const update of friendUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用business的队列处理机制，避免频繁请求
        await friendBusiness.handleTableUpdates(dataItem.version, dataItem.friendId)
      }
    }

    // 处理用户更新
    for (const update of userUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用用户business处理用户信息更新，userId在dataItem中
        await userBusiness.handleTableUpdates(dataItem.userId, dataItem.version)
      }
    }
  }
}
