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

import { defineStore } from 'pinia'
import { sendAgentMessageApi } from 'renderModule/api/agent'
import Logger from 'renderModule/utils/logger'

const logger = new Logger('ChatAiAssistantStore')

export interface IChatAiMessage {
  id: string
  role: 'user' | 'assistant'
  content: string
  streaming?: boolean
  timestamp: number
}

interface IChatAiThread {
  /** Agent 侧 conversationId（由 module+refId 派生） */
  agentConversationId: string
  topicId: string
  messages: IChatAiMessage[]
}

/** agent conversationId → 当前流式气泡 */
const pendingStreams = new Map<string, { imConversationId: string, assistantId: string }>()

function createMsgId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

/**
 * IM 会话 AI 侧栏：按当前 IM conversationId 隔离上下文（module=chat）。
 * 与独立 AI 窗（workspace）不共用 thread。
 */
export const useChatAiAssistantStore = defineStore('useChatAiAssistantStore', {
  state: () => ({
    threads: {} as Record<string, IChatAiThread>,
    streamingImId: '' as string,
  }),
  getters: {
    messagesOf: state => (imConversationId: string): IChatAiMessage[] => {
      return state.threads[imConversationId]?.messages || []
    },
    isStreaming: state => (imConversationId: string): boolean => {
      return state.streamingImId === imConversationId
    },
  },
  actions: {
    ensureThread(imConversationId: string): IChatAiThread {
      let thread = this.threads[imConversationId]
      if (!thread) {
        thread = {
          agentConversationId: '',
          topicId: '',
          messages: [],
        }
        this.threads[imConversationId] = thread
      }
      return thread
    },

    setPendingStream(agentConversationId: string, imConversationId: string, assistantId: string) {
      if (!agentConversationId)
        return
      pendingStreams.set(agentConversationId, { imConversationId, assistantId })
    },

    getPendingStream(agentConversationId: string) {
      return pendingStreams.get(agentConversationId) || null
    },

    clearPendingStream(agentConversationId: string) {
      pendingStreams.delete(agentConversationId)
    },

    appendUser(imConversationId: string, content: string) {
      const thread = this.ensureThread(imConversationId)
      thread.messages.push({
        id: createMsgId('u'),
        role: 'user',
        content,
        timestamp: Date.now(),
      })
    },

    beginAssistant(imConversationId: string): string {
      const thread = this.ensureThread(imConversationId)
      const id = createMsgId('a')
      thread.messages.push({
        id,
        role: 'assistant',
        content: '',
        streaming: true,
        timestamp: Date.now(),
      })
      this.streamingImId = imConversationId
      return id
    },

    appendDelta(imConversationId: string, assistantId: string, delta: string) {
      if (!delta)
        return
      const thread = this.threads[imConversationId]
      const msg = thread?.messages.find(m => m.id === assistantId)
      if (!msg)
        return
      msg.content += delta
    },

    endStream(imConversationId: string, assistantId: string, fallback?: string) {
      const thread = this.threads[imConversationId]
      const msg = thread?.messages.find(m => m.id === assistantId)
      if (msg) {
        if (!msg.content.trim() && fallback)
          msg.content = fallback
        msg.streaming = false
      }
      if (this.streamingImId === imConversationId)
        this.streamingImId = ''
    },

    /**
     * 处理 WS MESSAGE_STREAM。仅当本侧栏有 pending 时消费。
     * @returns 是否已处理（已处理则 IM 消息流不必再拼）
     */
    applyStream(payload: {
      conversationId?: string
      streamId?: string
      delta?: string
      done?: boolean
      event?: string
      dataJson?: string
    }): boolean {
      const agentConversationId = payload.conversationId || ''
      if (!agentConversationId)
        return false
      const pending = pendingStreams.get(agentConversationId)
      if (!pending)
        return false

      const { imConversationId, assistantId } = pending
      const event = payload.event || (payload.done ? 'done' : 'delta')

      if (event === 'delta' || (!payload.event && payload.delta)) {
        if (payload.delta)
          this.appendDelta(imConversationId, assistantId, payload.delta)
        return true
      }

      if (event === 'error') {
        let message = payload.delta || '生成失败'
        if (payload.dataJson) {
          try {
            const data = JSON.parse(payload.dataJson)
            if (data?.message)
              message = String(data.message)
          }
          catch {
            /* ignore */
          }
        }
        this.endStream(imConversationId, assistantId, message)
        pendingStreams.delete(agentConversationId)
        return true
      }

      if (event === 'done' || payload.done) {
        this.endStream(imConversationId, assistantId)
        pendingStreams.delete(agentConversationId)
        return true
      }

      // lg / host 等事件：侧栏第一期忽略，但仍视为已消费
      return true
    },

    async sendText(imConversationId: string, text: string): Promise<void> {
      const content = text.trim()
      if (!content || !imConversationId)
        return
      if (this.streamingImId === imConversationId)
        return

      const thread = this.ensureThread(imConversationId)
      this.appendUser(imConversationId, content)
      const assistantId = this.beginAssistant(imConversationId)

      try {
        const res = await sendAgentMessageApi({
          parts: [{ type: 'text', text: content }],
          module: 'chat',
          refId: imConversationId,
          topicId: thread.topicId || undefined,
          conversationId: thread.agentConversationId || undefined,
          clientMsgId: createMsgId('cmsg'),
          interactMode: 'ask',
        })
        if (res.code !== 0 || !res.result) {
          this.endStream(imConversationId, assistantId, (res as any).msg || (res as any).message || '发送失败')
          return
        }
        const { conversationId, topicId } = res.result
        if (conversationId)
          thread.agentConversationId = conversationId
        if (topicId)
          thread.topicId = topicId
        this.setPendingStream(conversationId, imConversationId, assistantId)
        logger.info({
          text: '侧栏 AI 已受理',
          data: { imConversationId, conversationId, topicId },
        })
      }
      catch (err) {
        logger.error({ text: '侧栏 AI 发送失败', data: { error: (err as Error).message } })
        this.endStream(imConversationId, assistantId, '发送失败')
      }
    },
  },
})
