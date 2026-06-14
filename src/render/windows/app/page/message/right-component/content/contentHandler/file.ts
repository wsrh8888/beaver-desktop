import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { CacheType } from 'commonModule/type/cache/cache'
import Message from 'renderModule/components/ui/message'
import { getFileNameFromUrl } from 'renderModule/utils/file/index'
import { BaseMessageHandler } from './base'

/**
 * 文件消息处理器
 */
class FileHandler extends BaseMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'save':
        return this.handleSave(message)
      case 'open':
        return this.handleOpen(message)
      case 'multiSelect':
        this.enterMultiSelect(message)
        return Promise.resolve()
      default:
        console.log('未知的文件消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['save', 'open', 'forward', 'delete', 'multiSelect']
  }

  getMenuItems(): ContextMenuItem[] {
    return [
      { id: 'open', label: '打开' },
      { id: 'save', label: '下载' },
      { id: 'multiSelect', label: '多选' },
    ]
  }

  private async handleSave(message: any): Promise<void> {
    const fileUrl = message.msg.fileMsg?.fileUrl
    const filename = message.msg.fileMsg?.fileName || getFileNameFromUrl(fileUrl) || 'file'
    if (fileUrl) {
      await this.downloadFile(fileUrl, filename)
    }
  }

  private async handleOpen(message: any): Promise<void> {
    const fileUrl = message.msg.fileMsg?.fileUrl
    if (!fileUrl) {
      Message.error('无法获取文件地址')
      return
    }

    const localPath = await electron.cache.open(CacheType.USER_IMAGE, fileUrl)
    if (!localPath) {
      Message.error('文件打开失败')
    }
  }
}

// 导出单例实例
export const fileHandler = new FileHandler()
