import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import Message from 'renderModule/components/ui/message'
import { VideoPlayer } from 'renderModule/core/media/video'
import { getFileNameFromUrl } from 'renderModule/utils/file/index'
import { BaseMessageHandler } from './base'

/**
 * 视频消息处理器
 */
class VideoHandler extends BaseMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'save':
        return this.handleSave(message)
      case 'play':
        return this.handlePlay(message)
      case 'multiSelect':
        this.enterMultiSelect(message)
        return Promise.resolve()
      default:
        console.log('未知的视频消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['save', 'play', 'forward', 'delete', 'multiSelect']
  }

  getMenuItems(): ContextMenuItem[] {
    return [
      { id: 'play', label: '播放' },
      { id: 'save', label: '下载' },
      { id: 'multiSelect', label: '多选' },
    ]
  }

  private async handleSave(message: any): Promise<void> {
    const videoUrl = message.msg.videoMsg?.fileUrl
    const filename = message.msg.videoMsg?.fileName || getFileNameFromUrl(videoUrl) || 'video.mp4'
    if (videoUrl) {
      await this.downloadFile(videoUrl, filename)
    }
  }

  private async handlePlay(message: any): Promise<void> {
    const mediaUrl = message.msg.videoMsg?.fileUrl
    if (!mediaUrl) {
      Message.error('无法获取视频地址')
      return
    }

    await VideoPlayer.open(mediaUrl)
  }
}

// 导出单例实例
export const videoHandler = new VideoHandler()
