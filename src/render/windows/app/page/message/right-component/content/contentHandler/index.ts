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

import type { IMessageHandler } from './base'
import Logger from 'renderModule/utils/logger'
import { MessageContentType } from 'renderModule/windows/app/page/message/right-component/content/utils/data'
import { audioFileHandler } from './audio'
import { emojiHandler } from './emoji'
import { fileHandler } from './file'
import { imageHandler } from './image'
import { textHandler } from './text'
import { videoHandler } from './video'
import { voiceHandler } from './voice'

const logger = new Logger('MessageHandlerFactory')

// 导出工厂方法
export function getMenuItems(messageType: MessageContentType, hasTextSelected: boolean = false, isSender: boolean = false) {
  return MessageHandlerFactory.getMenuItems(messageType, hasTextSelected, isSender)
}

/**
 * 消息处理器工厂
 */
export class MessageHandlerFactory {
  /**
   * 根据消息类型获取对应的处理器实例
   */
  static getHandler(messageType: MessageContentType): IMessageHandler {
    switch (messageType) {
      case MessageContentType.TEXT:
        return textHandler
      case MessageContentType.IMAGE:
        return imageHandler
      case MessageContentType.VIDEO:
        return videoHandler
      case MessageContentType.VOICE:
        return voiceHandler
      case MessageContentType.FILE:
        return fileHandler
      case MessageContentType.EMOJI:
        return emojiHandler
      case MessageContentType.AUDIO_FILE:
        return audioFileHandler
      case MessageContentType.CALL:
      case MessageContentType.WITHDRAW:
      case MessageContentType.REPLY:
      case MessageContentType.FORWARD:
        // 这些类型暂时使用基础处理器或文本处理器的逻辑（如删除、撤回等基础功能）
        return textHandler
      default:
        logger.warn({ text: '未知的消息类型，使用文本处理器', data: { messageType } })
        return textHandler
    }
  }

  /**
   * 根据消息类型获取对应的菜单项
   */
  static getMenuItems(messageType: MessageContentType, hasTextSelected: boolean = false, isSender: boolean = false): ContextMenuItem[] {
    const handler = this.getHandler(messageType)
    return handler.getMenuItems(hasTextSelected, isSender)
  }

  /**
   * 直接处理菜单命令
   * 返回值为 'forward' 字符串时，表示上层需要弹出转发对话框
   */
  static async handleCommand(messageType: MessageContentType, commandId: string, message: any): Promise<any> {
    const handler = this.getHandler(messageType)
    return handler.handleCommand(commandId, message)
  }
}
