import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { BaseMessageHandler } from './base'

/**
 * 文本消息处理器
 */
class TextHandler extends BaseMessageHandler {
  // 文本消息的菜单项
  private textMenuItems: ContextMenuItem[] = [
    {
      id: 'copy',
      label: '复制',
    },
  ]

  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'copy':
        return this.handleCopy(message)
      case 'forward':
        return this.forwardMessage(message)
      case 'delete':
        return this.deleteMessage(message)
      default:
        console.log('未知的文本消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['copy', 'forward', 'delete']
  }

  getMenuItems(hasTextSelected: boolean = false): ContextMenuItem[] {
    // 文本消息：如果有选中文本，只显示复制；否则显示完整菜单
    if (hasTextSelected) {
      return [
        {
          id: 'copy',
          label: '复制',
        },
      ]
    }
    return this.textMenuItems
  }

  private async handleCopy(message: any): Promise<void> {
    const selectedText = window.getSelection()?.toString().trim()
    const textToCopy = selectedText || message.msg.textMsg?.content || ''
    if (textToCopy) {
      await this.copyToClipboard(textToCopy)
    }
  }
}

// 导出单例实例
export const textHandler = new TextHandler()
