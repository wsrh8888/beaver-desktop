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

import type { QueueItem } from '../base/base'
import { NotificationEmojiCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { getEmojiPackageContentsByRelationIdsApi } from 'mainModule/api/emoji'
import dBServiceEmojiPackageEmoji  from 'mainModule/database/services/emoji/package-emoji'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import { BaseBusiness } from '../base/base'

/**
 * 表情包表情关联同步队列项
 */
interface PackageEmojiSyncItem extends QueueItem {
  relationIds: string[]
}

/**
 * 表情包表情关联业务逻辑
 */
class EmojiPackageEmojiBusiness extends BaseBusiness<PackageEmojiSyncItem> {
  protected readonly businessName = 'EmojiPackageEmojiBusiness'

  constructor() {
    super({
      queueSizeLimit: 20, // 表情包表情关联同步请求较少
      delayMs: 1000, // 1秒延迟批量处理
    })
  }
  async getEmojisByPackageIds(packageIds: string[]) {
    return await dBServiceEmojiPackageEmoji.getEmojisByPackageIds({ packageIds })
  }

  /**
   * 处理表情包表情关联表的更新通知
   */
  async handleTableUpdates(version: number, relationId: string) {
    this.addToQueue({
      key: `emoji_package_emoji_${relationId}_${version}`,
      data: { version, relationId },
      timestamp: Date.now(),
      relationIds: [relationId],
    })
  }

  /**
   * 批量处理表情包表情关联同步请求
   */
  protected async processBatchRequests(items: PackageEmojiSyncItem[]): Promise<void> {
    // 聚合所有需要同步的relationIds
    const relationIds = [...new Set(items.flatMap(item => item.relationIds))]
    this.logger.info({ text: '开始表情包表情关联数据同步', data: { itemCount: items.length, relationIdCount: relationIds.length } })

    if (relationIds.length === 0) {
      return
    }

    try {
      // 直接用relationIds获取表情包内容详情
      const response = await getEmojiPackageContentsByRelationIdsApi({
        relationIds: relationIds,
      })

      if (response.result?.contents && response.result.contents.length > 0) {
        // 更新本地数据库
        const contentRows = response.result.contents.map((contentData: any) => ({
          relationId: contentData.relationId,
          packageId: contentData.packageId,
          emojiId: contentData.emojiId,
          sortOrder: contentData.sortOrder,
          version: contentData.version,
          createdAt: contentData.createdAt,
          updatedAt: contentData.updatedAt,
        }))

        await dBServiceEmojiPackageEmoji.batchCreate({ relations: contentRows })

        // 发送通知到render进程，告知表情包内容数据已同步
        sendMainNotification('*', NotificationModule.EMOJI, NotificationEmojiCommand.EMOJI_PACKAGE_CONTENT_UPDATE, {
          updatedPackageContents: contentRows.map((content: any) => ({
            relationId: content.relationId,
            packageId: content.packageId,
            emojiId: content.emojiId,
            version: content.version,
          })),
        })
      }
    } catch (error) {
      this.logger.error({ text: '批量同步表情包表情关联失败', data: { relationIdCount: relationIds.length, error: (error as Error)?.message } })
    }
  }
}

// 导出单例实例
export default new EmojiPackageEmojiBusiness()
