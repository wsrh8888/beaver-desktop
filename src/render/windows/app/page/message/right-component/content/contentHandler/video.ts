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
import Logger from 'renderModule/utils/logger'
import Message from 'renderModule/components/ui/message'
import { VideoPlayer } from 'renderModule/core/media/video'
import { getFileNameFromUrl } from 'renderModule/utils/file/index'
import { BaseMessageHandler } from './base'

const logger = new Logger('VideoMessageHandler')

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
        logger.warn({ text: '未知的视频消息命令', data: { commandId } })
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
