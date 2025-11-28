import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { BaseMessageHandler } from './base'

/**
 * 音频消息处理器
 */
class AudioHandler extends BaseMessageHandler {
  // 音频消息的菜单项
  private audioMenuItems: ContextMenuItem[] = [
    {
      id: 'save',
      label: '保存音频',
    },
    {
      id: 'play',
      label: '播放',
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
      case 'play':
        return this.handlePlay(message)
      default:
        console.log('未知的音频消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['save', 'play', 'forward', 'delete']
  }

  getMenuItems(): ContextMenuItem[] {
    return this.audioMenuItems
  }

  private async handleSave(message: any): Promise<void> {
    const audioUrl = message.msg.audioMsg?.url
    const filename = message.msg.audioMsg?.name || 'audio.mp3'
    if (audioUrl) {
      await this.downloadFile(audioUrl, filename)
    }
  }

  private async handlePlay(message: any): Promise<void> {
    console.log('播放音频功能开发中', message)
    // TODO: 实现播放逻辑
  }
}

// 导出单例实例
export const audioHandler = new AudioHandler()
