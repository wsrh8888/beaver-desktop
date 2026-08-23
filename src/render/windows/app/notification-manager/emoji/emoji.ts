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

import Logger from 'renderModule/utils/logger'
import { useEmojiStore } from '../../pinia/emoji/emoji'

const logger = new Logger('DatabaseEmojiEventManager')

class DatabaseEmojiEventManager {
  /**
   * 处理表情基础表更新通知
   */
  async processEmojiUpdate(data: any) {
    logger.info({
      text: '收到表情基础表更新通知',
      data,
    })

    try {
      const emojiStore = useEmojiStore()

      // 处理推送的数据格式
      if (data?.updatedEmojis && Array.isArray(data.updatedEmojis)) {
        // 这里可以根据更新的表情ID来重新加载表情包数据
        // 或者触发表情数据的重新获取
        logger.info({
          text: `表情基础表更新，${data.updatedEmojis.length} 个表情数据已更新`,
          data: { updatedEmojis: data.updatedEmojis },
        })

        // 通知表情store进行相应处理
        emojiStore.handleEmojiUpdate(data)
      }
      else {
        console.warn('表情信息更新缺少必要参数', { data })
      }
    }
    catch (error) {
      logger.error({
        text: '处理表情基础表更新失败',
        data: { error: (error as Error).message },
      })
    }
  }
}

export default new DatabaseEmojiEventManager()
