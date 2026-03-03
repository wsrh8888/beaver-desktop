/**
 * 基础消息处理器类
 */
import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { copyToClipboard as copyTextToClipboard } from '../utils/copy'

export interface IMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void>
  getSupportedCommands(): string[]
  getMenuItems(hasTextSelected?: boolean): ContextMenuItem[]
}

export abstract class BaseMessageHandler implements IMessageHandler {
  abstract handleCommand(commandId: string, message: any): Promise<void>
  abstract getSupportedCommands(): string[]
  abstract getMenuItems(hasTextSelected?: boolean): ContextMenuItem[]

  /** 复制文本到剪贴板（走 utils/copy，Electron 下主进程） */
  protected async copyToClipboard(text: string): Promise<void> {
    await copyTextToClipboard(text)
  }

  // 公共方法：下载文件
  protected async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
      console.log('文件下载成功')
    }
    catch (error) {
      console.error('文件下载失败:', error)
      throw error
    }
  }
}
