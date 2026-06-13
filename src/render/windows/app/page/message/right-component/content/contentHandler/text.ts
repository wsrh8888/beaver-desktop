import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { getSelectedText } from 'renderModule/windows/app/page/message/right-component/content/utils/copy'
import { BaseMessageHandler } from './base'

/**
 * 文本消息处理器
 */
class TextHandler extends BaseMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'copy':
        return this.handleCopy(message)
      case 'reply':
        this.setReplyMessage(message)
        return Promise.resolve()
      case 'forward':
        // forward 由 content.vue 上层处理弹窗，此处返回特殊标记让上层识别
        return Promise.resolve('forward' as any)
      case 'recall':
        return this.recallMessage(message)
      case 'delete':
        return this.deleteMessage(message)
      case 'multiSelect':
        this.enterMultiSelect(message)
        return Promise.resolve()
      default:
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['copy', 'reply', 'forward', 'recall', 'delete', 'multiSelect']
  }

  getMenuItems(hasTextSelected: boolean = false, isSender: boolean = false): ContextMenuItem[] {
    if (hasTextSelected) {
      return [{ id: 'copy', label: '复制' }, { id: 'multiSelect', label: '多选' }]
    }
    const items: ContextMenuItem[] = [
      { id: 'copy', label: '复制' },
      { id: 'reply', label: '引用' },
      { id: 'forward', label: '转发' },
    ]
    if (isSender) {
      items.push({ id: 'recall', label: '撤回' })
    }
    items.push({ id: 'delete', label: '删除' })
    items.push({ id: 'multiSelect', label: '多选' })
    return items
  }

  private async handleCopy(message: any): Promise<void> {
    // 优先用右键打开菜单时保存的选中文字（点击复制时选区可能已丢失）
    const selectedText = (message as any)._selectedText ?? getSelectedText()
    const textToCopy = selectedText || message.msg.textMsg?.content || ''
    if (textToCopy) {
      await this.copyToClipboard(textToCopy)
    }
  }
}

// 导出单例实例
export const textHandler = new TextHandler()
