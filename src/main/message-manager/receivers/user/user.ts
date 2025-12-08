import { userBusiness } from 'mainModule/business/user/user'

/**
 * @description: 用户资料接收器 - 处理 users 表的操作
 */
export class UserReceiver {
  /**
   * 处理用户表更新通知
   * 只处理 users 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    // user 模块的 tableUpdatesBody 直接就是单个表的更新结构

    // 检查是否是 users 表的更新
    if (tableUpdatesBody.table !== 'users') {
      console.warn('UserReceiver 收到非 users 表的更新', tableUpdatesBody)
      return
    }

    // 处理用户资料更新
    if (tableUpdatesBody?.version && tableUpdatesBody?.targetId) {
      await userBusiness.handleTableUpdates(tableUpdatesBody.targetId, tableUpdatesBody.version)
    }
  }
}
