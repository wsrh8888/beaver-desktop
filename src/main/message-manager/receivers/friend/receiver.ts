import friendBusiness from 'mainModule/business/friend/friend'

/**
 * @description: 好友操作接收器 - 处理friends表的操作
 * 不使用批量处理框架，直接在handle方法中处理消息
 */
class FriendReceiver {
  /**
   * 处理好友表更新通知
   * 只处理 friends 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 过滤出只包含 friends 的更新，逐个处理
    const friendUpdates = tableUpdates.filter((update: any) => update.table === 'friends')

    for (const update of friendUpdates) {
      // update.data 是数组，需要遍历每个数据项
      for (const dataItem of update.data) {
        // 使用business的队列处理机制，避免频繁请求
        await friendBusiness.handleTableUpdates(dataItem.version, dataItem?.friendId)
      }
    }
  }
}

export default new FriendReceiver()
