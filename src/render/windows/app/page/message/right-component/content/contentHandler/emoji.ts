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

import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import Logger from 'renderModule/utils/logger'
import { BaseMessageHandler } from './base'

const logger = new Logger('EmojiMessageHandler')

/**
 * 表情消息处理器
 */
class EmojiHandler extends BaseMessageHandler {
  // 表情消息的菜单项
  private emojiMenuItems: ContextMenuItem[] = [
    {
      id: 'favorite',
      label: '添加到收藏',
    },
  ]

  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'favorite':
        return this.handleAddToFavorite(message)
      case 'copy':
        return this.handleCopy(message)
      case 'multiSelect':
        this.enterMultiSelect(message)
        return Promise.resolve()
      default:
        logger.warn({ text: '未知的表情消息命令', data: { commandId } })
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['favorite', 'copy', 'multiSelect']
  }

  getMenuItems(): ContextMenuItem[] {
    return [...this.emojiMenuItems, { id: 'multiSelect', label: '多选' }]
  }

  private async handleAddToFavorite(message: any): Promise<void> {
    try {
      const emojiId = message.msg.emojiMsg?.emojiId
      const packageId = message.msg.emojiMsg?.packageId

      if (!emojiId) {
        logger.error({ text: '无法获取表情ID', data: { messageId: message?.id } })
        return
      }

      // 这里应该调用收藏表情的API
      logger.info({ text: '添加到表情收藏', data: { emojiId, packageId } })
      // TODO: 实现收藏表情的逻辑
    }
    catch (error) {
      logger.error({ text: '添加到表情收藏失败', data: { error: (error as Error)?.message } })
      // TODO: 可以添加错误提示
    }
  }

  private async handleCopy(message: any): Promise<void> {
    try {
      // 可以复制表情的文本表示或者其他信息
      const emojiId = message.msg.emojiMsg?.emojiId
      const textToCopy = `[表情:${emojiId}]`

      await this.copyToClipboard(textToCopy)
      logger.info({ text: '表情信息已复制到剪贴板', data: { emojiId } })
    }
    catch (error) {
      logger.error({ text: '复制表情信息失败', data: { error: (error as Error)?.message } })
      // TODO: 可以添加错误提示
    }
  }
}

// 导出单例实例
export const emojiHandler = new EmojiHandler()
