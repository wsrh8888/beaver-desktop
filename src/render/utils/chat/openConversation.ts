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

import Message from 'renderModule/components/ui/message'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useGroupStore } from 'renderModule/windows/app/pinia/group/group'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import Logger from 'renderModule/utils/logger';
const logger = new Logger('openConversation')


function parseGroupId(conversationId: string): string | null {
  if (!conversationId.startsWith('group_')) {
    return null
  }
  return conversationId.slice('group_'.length)
}

export async function isGroupConversationActive(conversationId: string): Promise<boolean> {
  const groupId = parseGroupId(conversationId)
  if (!groupId) {
    return true
  }

  const result = await electron.database.group.getGroupsBatch({ groupIds: [groupId] })
  return result.list.length > 0
}

export async function removeDissolvedGroupConversation(
  conversationId: string,
  options?: { showMessage?: boolean },
) {
    logger.info({ text: 'removeDissolvedGroupConversation 开始' })
  const groupId = parseGroupId(conversationId)
  const conversationStore = useConversationStore()
  const groupStore = useGroupStore()
  const messageViewStore = useMessageViewStore()

  if (options?.showMessage !== false) {
    Message.warning('群聊已解散')
  }

  await conversationStore.removeLocalConversation(conversationId)

  if (groupId) {
    groupStore.removeGroup(groupId)
  }

  if (messageViewStore.currentChatId === conversationId) {
    messageViewStore.currentChatId = null
  }
}

/**
 * 打开会话前检查群是否仍有效；已解散则提示并清理本地数据
 */
export async function tryOpenConversation(conversationId: string): Promise<boolean> {
  if (!parseGroupId(conversationId)) {
    return true
  }

  const active = await isGroupConversationActive(conversationId)
  if (active) {
    return true
  }

  await removeDissolvedGroupConversation(conversationId)
  return false
}
