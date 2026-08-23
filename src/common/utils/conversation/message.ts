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

import { MessageType } from '../../type/ajax/chat'

/**
 * @description: 生成消息预览文本
 * @param msg 消息协议体
 */
export function generateMessagePreview(msg: any): string {
  switch (msg.type) {
    case MessageType.TEXT:
      return msg.textMsg?.content || '[文本消息]'
    case MessageType.IMAGE:
      return '[图片]'
    case MessageType.VIDEO:
      return '[视频]'
    case MessageType.FILE:
      return `[文件] ${msg.fileMsg?.fileName || ''}`
    case MessageType.VOICE:
      return `[语音] ${msg.voiceMsg?.duration ? `${msg.voiceMsg.duration}″` : ''}`
    case MessageType.AUDIO_FILE:
      return `[音频] ${msg.audioFileMsg?.fileName || ''}`
    case MessageType.EMOJI:
      return '[表情]'
    case MessageType.WITHDRAW:
      return '[消息已撤回]'
    case MessageType.NOTIFICATION:
      return '[系统消息]'
    case MessageType.MARKDOWN:
      return msg.markdownMsg?.title || msg.markdownMsg?.content || '[Markdown]'
    case MessageType.LINK:
      return `[链接] ${msg.linkMsg?.title || ''}`
    case MessageType.CLOUD_DOC:
      return `[文档] ${msg.cloudDocMsg?.title || ''}`
    case MessageType.CARD: {
      const t = msg.cardMsg?.cardType
      if (t === 1) return '[个人名片]'
      if (t === 2) return '[群名片]'
      if (t === 3) return '[圈子名片]'
      return '[名片]'
    }
    default:
      return '[未知消息]'
  }
}
