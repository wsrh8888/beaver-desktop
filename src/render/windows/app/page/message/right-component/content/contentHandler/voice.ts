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
import { BaseMessageHandler } from './base'
import Logger from 'renderModule/utils/logger';
const logger = new Logger('voice')


class VoiceHandler extends BaseMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void> {
    logger.info({ text: 'handleCommand 开始' })
    switch (commandId) {
      case 'reply':
        this.setReplyMessage(message)
        return Promise.resolve()
      case 'forward':
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
    logger.info({ text: 'getSupportedCommands 开始' })
    return ['reply', 'forward', 'recall', 'delete', 'multiSelect']
  }

  getMenuItems(_hasTextSelected: boolean = false, isSender: boolean = false): ContextMenuItem[] {
    logger.info({ text: 'getMenuItems 开始' })
    const items: ContextMenuItem[] = [
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
}

export const voiceHandler = new VoiceHandler()
