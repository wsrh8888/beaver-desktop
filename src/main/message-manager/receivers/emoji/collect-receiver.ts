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

import favoriteEmojiBusiness from 'mainModule/business/emoji/favorite-emoji'
import favoriteEmojiPackageBusiness from 'mainModule/business/emoji/favorite-package'
import emojiPackageEmojiBusiness from 'mainModule/business/emoji/package-emoji'
import emojiPackageBusiness from 'mainModule/business/emoji/package'
import emojiBusiness from 'mainModule/business/emoji/emoji'
import Logger from 'mainModule/utils/logger'
const logger = new Logger('collect-receiver')


/**
 * @description: 表情收藏接收器 - 处理表情收藏相关表的操作
 */
class CollectReceiver {
  /**
   * 处理表情相关表的更新通知
   * 处理 emoji、emoji_collect、emoji_package_collect、emoji_package_emoji 表的更新
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    logger.info({ text: 'handleTableUpdates 开始' })
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
      } else if (update.table === 'emoji_package') {
        // 处理表情包基础表更新
        for (const dataItem of update.data) {
          if (dataItem?.version && dataItem?.packageId) {
            await emojiPackageBusiness.handleTableUpdates(dataItem.version, dataItem.packageId)
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
          if (dataItem?.version && dataItem?.relationId) {
            emojiPackageEmojiBusiness.handleTableUpdates(dataItem.version, dataItem.relationId)
          }
        }
      }
    }
  }
}

export default new CollectReceiver()
