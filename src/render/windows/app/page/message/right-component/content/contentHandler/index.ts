import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'

import type { IMessageHandler } from './base'
import { MessageContentType } from '../utils/data'
import { audioHandler } from './audio'
import { fileHandler } from './file'
import { imageHandler } from './image'
import { textHandler } from './text'
import { videoHandler } from './video'

// 导出工厂方法
export function getMenuItems(messageType: MessageContentType, hasTextSelected: boolean = false) {
  return MessageHandlerFactory.getMenuItems(messageType, hasTextSelected)
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
        return audioHandler
      case MessageContentType.FILE:
        return fileHandler
      default:
        // 默认使用文本处理器
        console.warn(`未知的消息类型 ${messageType}，使用文本处理器`)
        return textHandler
    }
  }

  /**
   * 根据消息类型获取对应的菜单项
   */
  static getMenuItems(messageType: MessageContentType, hasTextSelected: boolean = false): ContextMenuItem[] {
    const handler = this.getHandler(messageType)
    return handler.getMenuItems(hasTextSelected)
  }

  /**
   * 直接处理菜单命令
   */
  static async handleCommand(messageType: MessageContentType, commandId: string, message: any): Promise<void> {
    const handler = this.getHandler(messageType)
    return handler.handleCommand(commandId, message)
  }
}
