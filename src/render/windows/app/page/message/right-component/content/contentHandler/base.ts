/**
 * 基础消息处理器类
 */
import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'

export interface IMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void>
  getSupportedCommands(): string[]
  getMenuItems(hasTextSelected?: boolean): ContextMenuItem[]
}

export abstract class BaseMessageHandler implements IMessageHandler {
  abstract handleCommand(commandId: string, message: any): Promise<void>
  abstract getSupportedCommands(): string[]
  abstract getMenuItems(hasTextSelected?: boolean): ContextMenuItem[]

  // 公共方法：复制到剪贴板
  protected async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text)
      console.log('文本已复制到剪贴板')
    }
    catch (error) {
      console.error('复制失败:', error)
      // 降级处理
      const textArea = document.createElement('textarea')
      textArea.value = text
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand('copy')
      document.body.removeChild(textArea)
    }
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
