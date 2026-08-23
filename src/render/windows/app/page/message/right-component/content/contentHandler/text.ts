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
import { getSelectedText } from 'renderModule/windows/app/page/message/right-component/content/utils/copy'
import { BaseMessageHandler } from './base'

/**
 * 文本消息处理器
 */
class TextHandler extends BaseMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void> {
    switch (commandId) {
      case 'copy':
        return this.handleCopy(message)
      case 'reply':
        this.setReplyMessage(message)
        return Promise.resolve()
      case 'forward':
        // forward 由 content.vue 上层处理弹窗，此处返回特殊标记让上层识别
        return Promise.resolve('forward' as any)
      case 'recall':
        return this.recallMessage(message)
      case 'delete':
        return this.deleteMessage(message)
      case 'multiSelect':
        this.enterMultiSelect(message)
        return Promise.resolve()
      default:
        return Promise.resolve()
    }
  }

  getSupportedCommands(): string[] {
    return ['copy', 'reply', 'forward', 'recall', 'delete', 'multiSelect']
  }

  getMenuItems(hasTextSelected: boolean = false, isSender: boolean = false): ContextMenuItem[] {
    if (hasTextSelected) {
      return [{ id: 'copy', label: '复制' }, { id: 'multiSelect', label: '多选' }]
    }
    const items: ContextMenuItem[] = [
      { id: 'copy', label: '复制' },
      { id: 'reply', label: '引用' },
      { id: 'forward', label: '转发' },
    ]
    if (isSender) {
      items.push({ id: 'recall', label: '撤回' })
    }
    items.push({ id: 'delete', label: '删除' })
    items.push({ id: 'multiSelect', label: '多选' })
    return items
  }

  private async handleCopy(message: any): Promise<void> {
    // 优先用右键打开菜单时保存的选中文字（点击复制时选区可能已丢失）
    const selectedText = (message as any)._selectedText ?? getSelectedText()
    const textToCopy = selectedText || message.msg.textMsg?.content || ''
    if (textToCopy) {
      await this.copyToClipboard(textToCopy)
    }
  }
}

// 导出单例实例
export const textHandler = new TextHandler()
