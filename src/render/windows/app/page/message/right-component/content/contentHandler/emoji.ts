import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { BaseMessageHandler } from './base'

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
    {
      id: 'copy',
      label: '复制',
    },
  ]

  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'favorite':
        return this.handleAddToFavorite(message)
      case 'copy':
        return this.handleCopy(message)
      default:
        console.log('未知的表情消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['favorite', 'copy']
  }

  getMenuItems(): ContextMenuItem[] {
    return this.emojiMenuItems
  }

  private async handleAddToFavorite(message: any): Promise<void> {
    try {
      const emojiId = message.msg.emojiMsg?.emojiId
      const packageId = message.msg.emojiMsg?.packageId

      if (!emojiId) {
        console.error('无法获取表情ID')
        return
      }

      // 这里应该调用收藏表情的API
      console.log('添加到表情收藏:', { emojiId, packageId })
      // TODO: 实现收藏表情的逻辑
    }
    catch (error) {
      console.error('添加到表情收藏失败:', error)
      // TODO: 可以添加错误提示
    }
  }

  private async handleCopy(message: any): Promise<void> {
    try {
      // 可以复制表情的文本表示或者其他信息
      const emojiId = message.msg.emojiMsg?.emojiId
      const textToCopy = `[表情:${emojiId}]`

      await this.copyToClipboard(textToCopy)
      console.log('表情信息已复制到剪贴板')
    }
    catch (error) {
      console.error('复制表情信息失败:', error)
      // TODO: 可以添加错误提示
    }
  }
}

// 导出单例实例
export const emojiHandler = new EmojiHandler()
