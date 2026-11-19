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

/**
 * agent 流式回复：把 ws 的 delta / done / error 拼进面板的消息里。
 *
 * 这条流寄生在 chat 的 ws 上（MESSAGE_STREAM），conversationId 就等于场景 refId，
 * 所以只认「本面板正开着一条流式气泡」的那些增量 —— 认领了就别再让 IM 消息流拼一遍。
 */
import Logger from 'renderModule/utils/logger'
import { useAiPanelStore } from '../store'

const logger = new Logger('AiPanelStream')

export interface IAiStreamPayload {
  conversationId?: string
  streamId?: string
  delta?: string
  done?: boolean
  event?: string
  dataJson?: string
}

/** 从 dataJson 里抠出错误文案，抠不出就用兜底 */
function parseErrorText(dataJson?: string): string {
  if (!dataJson)
    return ''
  try {
    const data = JSON.parse(dataJson)
    return data?.message ? String(data.message) : ''
  }
  catch {
    return ''
  }
}

/**
 * @returns 是否已由面板消费；false 表示这不是面板的流，调用方继续按 IM 消息处理
 */
export function handleStream(payload: IAiStreamPayload): boolean {
  const refId = payload.conversationId || ''
  if (!refId)
    return false

  const aiStore = useAiPanelStore()
  // 没有流式气泡 = 不是本面板发起的（比如用户没开面板），不认领
  if (!aiStore.isStreaming(refId))
    return false

  const event = payload.event || (payload.done ? 'done' : 'delta')

  if (event === 'delta') {
    aiStore.appendAssistantDelta(refId, payload.delta || '')
    return true
  }

  if (event === 'error') {
    const message = parseErrorText(payload.dataJson) || payload.delta || '生成失败'
    logger.error({ text: 'AI 回复失败', data: { refId, message } })
    aiStore.endAssistantStream(refId, message)
    return true
  }

  if (event === 'done' || payload.done) {
    aiStore.endAssistantStream(refId)
    return true
  }

  // lg / client_tool 等事件本期不渲染，但仍由面板消费，避免污染 IM 消息流
  return true
}
