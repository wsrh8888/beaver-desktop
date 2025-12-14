import type { INotificationPayload, NotificationModule } from 'commonModule/type/preload/notification'
import { NotificationEmojiCommand } from 'commonModule/type/preload/notification'

import Logger from 'renderModule/utils/logger'
// 导入表情模块的通知处理器
import emojiNotificationManager from './emoji'
import emojiCollectNotificationManager from './emoji-collect'
import emojiPackageNotificationManager from './emoji-package'
import emojiPackageCollectNotificationManager from './emoji-package-collect'
import emojiPackageContentNotificationManager from './emoji-package-content'

const logger = new Logger('表情模块通知路由器')

/**
 * @description: 表情模块通知路由器
 */
class EmojiNotificationRouter {
  /**
   * 处理表情模块的所有通知
   */
  async handleNotification(params: INotificationPayload<NotificationModule.EMOJI>) {
    logger.info({
      text: '收到表情模块通知',
      data: params,
    })
    switch (params.command) {
      case NotificationEmojiCommand.EMOJI_UPDATE:
        await emojiNotificationManager.processEmojiUpdate(params.data)
        break
      case NotificationEmojiCommand.EMOJI_COLLECT_UPDATE:
        await emojiCollectNotificationManager.processEmojiCollectUpdate(params.data)
        break
      case NotificationEmojiCommand.EMOJI_PACKAGE_UPDATE:
        await emojiPackageNotificationManager.processEmojiPackageUpdate(params.data)
        break
      case NotificationEmojiCommand.EMOJI_PACKAGE_COLLECT_UPDATE:
        await emojiPackageCollectNotificationManager.processEmojiPackageCollectUpdate(params.data)
        break
      case NotificationEmojiCommand.EMOJI_PACKAGE_CONTENT_UPDATE:
        await emojiPackageContentNotificationManager.processEmojiPackageContentUpdate(params.data)
        break
      default:
        console.warn('未知的表情通知命令:', params.command)
    }
  }
}

// 导出单例实例
export const emojiNotificationRouter = new EmojiNotificationRouter()
