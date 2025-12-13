import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { addEmojiApi } from 'renderModule/api/emoji'
import { previewOnlineFileApi } from 'renderModule/api/file'
import { BaseMessageHandler } from './base'

/**
 * 图片消息处理器
 */
class ImageHandler extends BaseMessageHandler {
  // 图片消息的菜单项
  private imageMenuItems: ContextMenuItem[] = [
    {
      id: 'copy',
      label: '复制',
    },
    {
      id: 'emoji',
      label: '添加到表情',
    },
    {
      id: 'download',
      label: '下载',
    },
  ]

  handleCommand(commandId: string, message: any): Promise<void> {
    console.error('11111111111111', commandId)
    switch (commandId) {
      case 'copy':
        return this.handleCopy(message)
      case 'emoji':
        return this.handleAddToEmoji(message)
      case 'download':
        return this.handleDownload(message)
      default:
        console.log('未知的图片消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['copy', 'emoji', 'download']
  }

  getMenuItems(): ContextMenuItem[] {
    return this.imageMenuItems
  }

  private async handleCopy(message: any): Promise<void> {
    // TODO: 复制图片到剪贴板
    console.log('复制图片功能开发中', message)
  }

  private async handleAddToEmoji(message: any): Promise<void> {
    try {
      const fileKey = message.msg.imageMsg?.fileKey
      if (!fileKey) {
        console.error('无法获取图片文件Key')
        return
      }

      // 生成表情标题（可以根据需要调整）
      const title = `表情_${Date.now()}`

      await addEmojiApi({
        fileKey,
        title,
        // packageId 可选，不指定则添加到默认收藏中
      })

      console.log('图片已成功添加到表情收藏')
      // TODO: 可以添加用户提示，如Toast通知
    }
    catch (error) {
      console.error('添加到表情失败:', error)
      // TODO: 可以添加错误提示
    }
  }

  private async handleDownload(message: any): Promise<void> {
    console.error('121111111111111111', message)
    const imageUrl = previewOnlineFileApi(message.msg.imageMsg?.fileKey)
    const filename = message.msg.imageMsg?.fileKey
    if (imageUrl) {
      await this.downloadFile(imageUrl, filename)
    }
  }
}

// 导出单例实例
export const imageHandler = new ImageHandler()
