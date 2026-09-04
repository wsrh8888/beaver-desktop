/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
        logger.warn({ text: '未知的表情通知命令', data: { command: params.command } })
    }
  }
}

// 导出单例实例
export const emojiNotificationRouter = new EmojiNotificationRouter()
