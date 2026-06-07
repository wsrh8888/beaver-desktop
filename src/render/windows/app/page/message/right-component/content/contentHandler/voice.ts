import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { BaseMessageHandler } from './base'

class VoiceHandler extends BaseMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'reply':
        this.setReplyMessage(message)
        return Promise.resolve()
      case 'forward':
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
    return ['reply', 'forward', 'recall', 'delete', 'multiSelect']
  }

  getMenuItems(_hasTextSelected: boolean = false, isSender: boolean = false): ContextMenuItem[] {
    const items: ContextMenuItem[] = [
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
}

export const voiceHandler = new VoiceHandler()
