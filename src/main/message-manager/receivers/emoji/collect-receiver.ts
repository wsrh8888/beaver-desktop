import favoriteEmojiBusiness from 'mainModule/business/emoji/favorite-emoji'
import favoriteEmojiPackageBusiness from 'mainModule/business/emoji/favorite-package'
import emojiPackageEmojiBusiness from 'mainModule/business/emoji/package-emoji'
import emojiBusiness from 'mainModule/business/emoji/emoji'

/**
 * @description: 表情收藏接收器 - 处理表情收藏相关表的操作
 */
class CollectReceiver {
  /**
   * 处理表情相关表的更新通知
   * 处理 emoji、emoji_collect、emoji_package_collect、emoji_package_emoji 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tableUpdates } = tableUpdatesBody

    // 处理各种表情相关表的更新
    for (const update of tableUpdates) {
      if (update.table === 'emoji') {
        // 处理表情基础表更新
        for (const dataItem of update.data) {
          if (dataItem?.version && dataItem?.emojiId) {
            await emojiBusiness.handleTableUpdates(dataItem.version, dataItem.emojiId)
          }
        }
      } else if (update.table === 'emoji_collect') {
        // 处理表情收藏表的更新
        for (const dataItem of update.data) {
          if (update.userId && dataItem?.version && dataItem?.emojiCollectId) {
            await favoriteEmojiBusiness.handleTableUpdates(dataItem.version, dataItem.emojiCollectId, update.userId)
          }
        }
      } else if (update.table === 'emoji_package_collect') {
        // 处理表情包收藏表的更新
        for (const dataItem of update.data) {
          if (update.userId && dataItem?.version && dataItem?.packageCollectId) {
            await favoriteEmojiPackageBusiness.handleTableUpdates(dataItem.version, dataItem.packageCollectId, update.userId)
          }
        }
      } else if (update.table === 'emoji_package_emoji') {
        // 处理表情包表情关联表的更新
        for (const dataItem of update.data) {
          if (dataItem?.version && dataItem?.emojiId && dataItem?.packageId) {
            emojiPackageEmojiBusiness.handleTableUpdates(dataItem.version, dataItem.emojiId, dataItem.packageId)
          }
        }
      }
    }
  }
}

export default new CollectReceiver()
