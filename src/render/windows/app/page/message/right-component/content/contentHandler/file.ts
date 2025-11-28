import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { BaseMessageHandler } from './base'

/**
 * 文件消息处理器
 */
class FileHandler extends BaseMessageHandler {
  // 文件消息的菜单项
  private fileMenuItems: ContextMenuItem[] = [
    {
      id: 'save',
      label: '保存文件',
    },
    {
      id: 'open',
      label: '打开文件',
      divided: true,
    },
    {
      id: 'forward',
      label: '转发',
    },
    {
      id: 'delete',
      label: '删除',
      divided: true,
    },
  ]

  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'save':
        return this.handleSave(message)
      case 'open':
        return this.handleOpen(message)
      default:
        console.log('未知的文件消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['save', 'open', 'forward', 'delete']
  }

  getMenuItems(): ContextMenuItem[] {
    return this.fileMenuItems
  }

  private async handleSave(message: any): Promise<void> {
    const fileUrl = message.msg.fileMsg?.url
    const filename = message.msg.fileMsg?.name || 'file'
    if (fileUrl) {
      await this.downloadFile(fileUrl, filename)
    }
  }

  private async handleOpen(message: any): Promise<void> {
    console.log('打开文件功能开发中', message)
    // TODO: 实现打开文件逻辑
  }
}

// 导出单例实例
export const fileHandler = new FileHandler()
