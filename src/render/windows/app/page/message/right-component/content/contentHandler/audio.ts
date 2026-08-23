/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { AudioPlayer } from 'renderModule/core/media/audio'
import { BaseMessageHandler } from './base'

/**
 * 音频消息处理器
 */
class AudioHandler extends BaseMessageHandler {
  // 音频消息的菜单项
  private audioMenuItems: ContextMenuItem[] = [
    
  ]

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
        console.log('未知的音频消息命令:', commandId)
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['save', 'play', 'forward', 'delete', 'multiSelect']
  }

  getMenuItems(): ContextMenuItem[] {
    return [{ id: 'multiSelect', label: '多选' }]
  }

  private async handleSave(message: any): Promise<void> {
    const audioUrl = message.msg.audioFileMsg?.fileUrl
    const filename = message.msg.audioFileMsg?.fileName || 'audio.mp3'
    if (audioUrl) {
      await this.downloadFile(audioUrl, filename)
    }
  }

  private async handlePlay(message: any): Promise<void> {
    const audioUrl = message.msg.audioFileMsg?.fileUrl
    const title = message.msg.audioFileMsg?.fileName || '未知文件'
    if (!audioUrl)
      return
    await AudioPlayer.play(audioUrl, title)
  }
}

// 导出单例实例
export const audioFileHandler = new AudioHandler()
