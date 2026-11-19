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
 * AI 面板的数据层：只存「当前是什么」，不发请求、不管时序。
 *
 *   threads[refId]  一个场景会话的上下文（话题 / 当前话题 / 消息 / 流式中那条）
 *   confirms[refId] 该会话待表态的确认请求，点头即出队
 *
 * 消息怎么来（接口、ws 流式、确认回传）由视图与 notification-manager/ 负责，
 * 它们调这里的动作写数据；视图只读 getters。store 因此不会越长越厚。
 */
import type { IAgentConfirmRequest, IAgentTopicItem, IAiChatMessage } from 'commonModule/type/ajax/agent'
import { defineStore } from 'pinia'

/** 首屏落地用的快照：话题 + 当前话题的一页消息 */
export interface IAiThreadSnapshot {
  topics: IAgentTopicItem[]
  activeTopicId: string
  messages: IAiChatMessage[]
}

/** 一个场景会话的上下文；refId 即 agent conversationId */
export interface IAiThread {
  topics: IAgentTopicItem[]
  /** 当前话题；空 = 下次发送让服务端新建 */
  activeTopicId: string
  messages: IAiChatMessage[]
  /** 正在流式的那条助手消息 id；空 = 空闲 */
  streamingId: string
}

function createMsgId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function emptyThread(): IAiThread {
  return { topics: [], activeTopicId: '', messages: [], streamingId: '' }
}

export const useAiPanelStore = defineStore('useAiPanelStore', {
  state: () => ({
    threads: {} as Record<string, IAiThread>,
    confirms: {} as Record<string, IAgentConfirmRequest[]>,
  }),

  getters: {
    messagesOf: state => (refId: string): IAiChatMessage[] => state.threads[refId]?.messages || [],
    activeTopicIdOf: state => (refId: string): string => state.threads[refId]?.activeTopicId || '',
    /** 生成中：禁输入、禁切新话题 */
    isStreaming: state => (refId: string): boolean => !!state.threads[refId]?.streamingId,
    /** 最前面一条待表态的确认；没有就 null */
    pendingConfirmOf: state => (refId: string): IAgentConfirmRequest | null => {
      return (state.confirms[refId] || [])[0] || null
    },
  },

  actions: {
    threadOf(refId: string): IAiThread {
      let thread = this.threads[refId]
      if (!thread) {
        thread = emptyThread()
        this.threads[refId] = thread
      }
      return thread
    },

    /** 历史拉回来整块落地（打开面板 / 换场景） */
    hydrate(refId: string, snapshot: IAiThreadSnapshot): void {
      this.threads[refId] = {
        topics: snapshot.topics,
        activeTopicId: snapshot.activeTopicId,
        messages: snapshot.messages,
        streamingId: '',
      }
    },

    /** 新话题：不建空数据，等下次发送由服务端建 */
    startNewTopic(refId: string): void {
      const thread = this.threadOf(refId)
      if (thread.streamingId)
        return
      thread.activeTopicId = ''
      thread.messages = []
    },

    /** 加载更多：把更早的一页插到最前面，按 id 去重（首屏与翻页可能重叠） */
    prependMessages(refId: string, list: IAiChatMessage[]): void {
      if (!list.length)
        return
      const thread = this.threadOf(refId)
      const exists = new Set(thread.messages.map(m => m.id))
      thread.messages = [...list.filter(m => !exists.has(m.id)), ...thread.messages]
    },
    /** 发送后回填服务端建好的话题 */
    applySendReceipt(refId: string, topicId: string, title: string): void {
      const thread = this.threadOf(refId)
      if (!topicId)
        return
      if (!thread.topics.some(t => t.topicId === topicId)) {
        thread.topics.unshift({
          topicId,
          conversationId: refId,
          title,
          updatedAt: Date.now(),
          version: Date.now(),
        })
      }
      thread.activeTopicId = topicId
    },

    addUserMessage(refId: string, content: string): void {
      this.threadOf(refId).messages.push({
        id: createMsgId('u'),
        role: 'user',
        content,
        timestamp: Date.now(),
      })
    },

    /** 开一条流式占位气泡，返回它的 id */
    beginAssistantMessage(refId: string): string {
      const thread = this.threadOf(refId)
      const id = createMsgId('a')
      thread.messages.push({
        id,
        role: 'assistant',
        content: '',
        streaming: true,
        timestamp: Date.now(),
      })
      thread.streamingId = id
      return id
    },

    /** ws 增量：拼到当前流式气泡尾部 */
    appendAssistantDelta(refId: string, delta: string): void {
      const thread = this.threads[refId]
      if (!delta || !thread?.streamingId)
        return
      const msg = thread.messages.find(m => m.id === thread.streamingId)
      if (msg)
        msg.content += delta
    },

    /** 流式结束：没有内容时用 fallback 顶一句，避免空气泡 */
    endAssistantStream(refId: string, fallback = ''): void {
      const thread = this.threads[refId]
      if (!thread?.streamingId)
        return
      const msg = thread.messages.find(m => m.id === thread.streamingId)
      if (msg) {
        if (!msg.content.trim() && fallback)
          msg.content = fallback
        msg.streaming = false
      }
      thread.streamingId = ''
    },

    pushConfirm(refId: string, request: IAgentConfirmRequest): void {
      const list = this.confirms[refId] || (this.confirms[refId] = [])
      if (list.some(c => c.requestId === request.requestId))
        return
      list.push(request)
    },

    /** 表态完成或服务端取消：出队。没送达时不要调，卡片要留着重试 */
    dropConfirm(refId: string, requestId: string): void {
      const list = this.confirms[refId]
      if (!list)
        return
      this.confirms[refId] = list.filter(c => c.requestId !== requestId)
    },
  },
})
