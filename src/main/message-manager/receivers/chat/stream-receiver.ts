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

import type { IChatMessageStreamBody } from 'commonModule/type/ws/message-types'
import { NotificationChatCommand, NotificationModule } from 'commonModule/type/preload/notification'
import { sendMainNotification } from 'mainModule/ipc/main-to-render'
import agentReceiver from '../agent'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('ChatStreamReceiver')

function parseStreamBody(raw: unknown): IChatMessageStreamBody | null {
  let body = raw
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body)
    }
    catch {
      return null
    }
  }
  if (!body || typeof body !== 'object')
    return null
  const record = body as Partial<IChatMessageStreamBody>
  if (!record.streamId)
    return null
  return {
    streamId: record.streamId,
    senderId: record.senderId || '',
    conversationId: record.conversationId || '',
    delta: typeof record.delta === 'string' ? record.delta : '',
    seq: Number(record.seq) || 0,
    done: Boolean(record.done),
    event: typeof record.event === 'string' ? record.event : '',
    dataJson: typeof record.dataJson === 'string' ? record.dataJson : '',
  }
}

/**
 * 流式增量只转给窗口。不写库、不占消息 seq。
 * 丢帧不影响历史，终稿仍走正式消息同步。
 */
class StreamReceiver {
  handle(data: { conversationId?: string, body: unknown }) {
    const body = parseStreamBody(data?.body)
    if (!body) {
      logger.warn({ text: '流式帧格式错误' })
      return
    }
    const conversationId = data.conversationId || body.conversationId || ''
    if (!conversationId) {
      logger.warn({ text: '流式帧缺少 conversationId', data: { streamId: body.streamId } })
      return
    }

    // client_tool 事件：服务端下发的本机工具调用。主进程直接执行并回传，不转发渲染进程。
    if (body.event === 'client_tool') {
      void agentReceiver.handle(conversationId, body.dataJson || '')
      return
    }

    logger.info({
      text: '转发流式增量',
      data: { conversationId, streamId: body.streamId, seq: body.seq, done: body.done, event: body.event },
    })

    sendMainNotification('*', NotificationModule.DATABASE_CHAT, NotificationChatCommand.MESSAGE_STREAM, {
      conversationId,
      streamId: body.streamId,
      senderId: body.senderId || '',
      delta: body.delta,
      seq: body.seq,
      done: body.done,
      event: body.event || '',
      dataJson: body.dataJson || '',
    })
  }
}

export default new StreamReceiver()
