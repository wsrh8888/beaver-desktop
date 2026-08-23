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

import { MessageType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'

/**
 * @description: 从编辑器 DOM 提取结构化消息列表 (IMessageMsg 格式)
 */
export function parseEditorDOM(editorElement: HTMLElement): IMessageMsg[] {
  const messages: IMessageMsg[] = []

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (text) {
        messages.push({
          type: MessageType.TEXT,
          textMsg: { content: text }
        })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.tagName === 'IMG') {
        const fileUrl = el.getAttribute('data-file-url')
        const typeStr = el.getAttribute('data-type') || 'image'
        const infoStr = el.getAttribute('data-info')
        const info = infoStr ? JSON.parse(infoStr) : {}

        if (fileUrl) {
          const msg: IMessageMsg = { type: MessageType.IMAGE }

          if (typeStr === 'emoji') {
            msg.type = MessageType.EMOJI
            msg.emojiMsg = {
              fileUrl,
              emojiId: info.emojiId || '',
              packageId: info.packageId || '',
              width: info.width,
              height: info.height
            }
          } else {
            msg.type = MessageType.IMAGE
            msg.imageMsg = {
              fileUrl,
              width: info.width || 0,
              height: info.height || 0
            }
          }
          messages.push(msg)
        }
      } else if (el.tagName === 'BR') {
        messages.push({
          type: MessageType.TEXT,
          textMsg: { content: '\n' }
        })
      } else {
        node.childNodes.forEach(child => walk(child))
      }
    }
  }

  editorElement.childNodes.forEach(child => walk(child))

  const merged: IMessageMsg[] = []
  for (const msg of messages) {
    const last = merged[merged.length - 1]
    if (msg.type === MessageType.TEXT && last && last.type === MessageType.TEXT && last.textMsg && msg.textMsg) {
      last.textMsg.content += msg.textMsg.content
    } else {
      merged.push(msg)
    }
  }
  return merged
}
