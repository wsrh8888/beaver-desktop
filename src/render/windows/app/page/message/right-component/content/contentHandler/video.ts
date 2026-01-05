import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { BaseMessageHandler } from './base'

/**
 * 视频消息处理器
 */
class VideoHandler extends BaseMessageHandler {
  // 视频消息的菜单项
  private videoMenuItems: ContextMenuItem[] = [

  ]

  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'save':
        return this.handleSave(message)
      case 'play':
        return this.handlePlay(message)
      default:
        console.log('未知的视频消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['save', 'play', 'forward', 'delete']
  }

  getMenuItems(): ContextMenuItem[] {
    return this.videoMenuItems
  }

  private async handleSave(message: any): Promise<void> {
    const videoUrl = message.msg.videoMsg?.url
    const filename = message.msg.videoMsg?.name || 'video.mp4'
    if (videoUrl) {
      await this.downloadFile(videoUrl, filename)
    }
  }

  private async handlePlay(message: any): Promise<void> {
    console.log('播放视频功能开发中', message)
    // TODO: 实现播放逻辑
  }
}

// 导出单例实例
export const videoHandler = new VideoHandler()
