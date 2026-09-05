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
import type { IAiArtifact, IAiChat, IAiChatListItem, IAiMessage } from 'renderModule/windows/ai/types/chat'
import { sendAgentMessageStream } from 'renderModule/api/agent'
import Logger from 'renderModule/utils/logger'
import { useAiAgentStore } from 'renderModule/windows/ai/pinia/agent'
import { useAiModelStore } from 'renderModule/windows/ai/pinia/model'
import { useAiSpaceStore } from 'renderModule/windows/ai/pinia/space'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

const DRAFT_ID = 'draft'

const logger = new Logger('AiChatStore')

/**
 * 1. 新建 → /new 草稿（不进侧栏）
 * 2. 发送：
 *    - 未选空间 → 云端「会话」
 *    - 选了本机空间 → 该空间下的「会话」
 * 3. 侧栏点条目 → /chat/:id
 *
 * 右侧产物：每个会话带 artifacts[]，按类型（md/html…）渲染；html 仅 1 个。
 */
export const useAiChatStore = defineStore('useAiChatStore', {
  state: () => ({
    chatList: [] as IAiChatListItem[],
    currentChatId: DRAFT_ID,
    chats: {
      [DRAFT_ID]: {
        id: DRAFT_ID,
        title: '新会话',
        timestamp: Date.now(),
        spaceId: null,
        skillId: 'general',
        messages: [],
        artifacts: [],
      },
    } as Record<string, IAiChat>,
  }),
  getters: {
    isDraft(state): boolean {
      return state.currentChatId === DRAFT_ID
    },
    currentChat(state): IAiChat | undefined {
      return state.chats[state.currentChatId]
    },
    /** 云端会话（无空间） */
    cloudChats(state): IAiChatListItem[] {
      return state.chatList.filter(item => item.spaceId === null)
    },
    /** 某本机空间下的会话 */
    sessionsBySpace(state): Record<string, IAiChatListItem[]> {
      const map: Record<string, IAiChatListItem[]> = {}
      for (const item of state.chatList) {
        if (!item.spaceId)
          continue
        if (!map[item.spaceId])
          map[item.spaceId] = []
        map[item.spaceId].push(item)
      }
      return map
    },
    /** 当前会话的产物列表（右侧 tab） */
    currentArtifacts(state): IAiArtifact[] {
      return state.chats[state.currentChatId]?.artifacts ?? []
    },
  },
  actions: {
    createId() {
      return `chat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    },

    openChat(id: string) {
      if (!this.chats[id] || id === DRAFT_ID)
        return false
      this.currentChatId = id
      const chat = this.chats[id]
      logger.info({ text: '打开会话', data: { chatId: id, spaceId: chat.spaceId, skillId: chat.skillId } })
      useAiViewStore().setActiveArtifact(chat.artifacts[0]?.id ?? null)
      return true
    },

    startNewChat(skillId = 'general') {
      const spaceStore = useAiSpaceStore()
      this.currentChatId = DRAFT_ID
      this.chats[DRAFT_ID] = {
        id: DRAFT_ID,
        title: '新会话',
        timestamp: Date.now(),
        spaceId: spaceStore.resolveTargetSpaceId(),
        skillId,
        messages: [],
        artifacts: [],
      }
    },

    promoteDraft(title: string, spaceId: string | null) {
      const draft = this.chats[DRAFT_ID]
      if (!draft)
        return DRAFT_ID

      const newId = this.createId()
      const now = Date.now()
      const chat: IAiChat = {
        id: newId,
        title,
        timestamp: now,
        spaceId,
        skillId: draft.skillId || 'general',
        messages: [],
        artifacts: [],
      }
      this.chats[newId] = chat
      this.chatList.unshift({
        id: newId,
        title,
        timestamp: now,
        spaceId,
      })
      this.currentChatId = newId

      this.chats[DRAFT_ID] = {
        id: DRAFT_ID,
        title: '新会话',
        timestamp: now,
        spaceId,
        skillId: draft.skillId || 'general',
        messages: [],
        artifacts: [],
      }

      return newId
    },

    touchChat(id: string) {
      const item = this.chatList.find(c => c.id === id)
      if (item)
        item.timestamp = Date.now()
      if (this.chats[id])
        this.chats[id].timestamp = Date.now()
    },

    appendUserMessage(chatId: string, content: string) {
      const chat = this.chats[chatId]
      if (!chat || !content.trim())
        return

      chat.messages.push({
        id: this.createId(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
      })
      this.touchChat(chatId)
    },

    appendAssistantReply(chatId: string, fullText: string) {
      const chat = this.chats[chatId]
      if (!chat)
        return

      const msg: IAiMessage = {
        id: this.createId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        streaming: true,
      }
      chat.messages.push(msg)

      let index = 0
      const timer = window.setInterval(() => {
        index += 1
        msg.content = fullText.slice(0, index)
        if (index >= fullText.length) {
          msg.streaming = false
          window.clearInterval(timer)
        }
      }, 20)

      this.touchChat(chatId)
    },

    /** 开一条可流式追加的助手消息，返回 messageId */
    beginAssistantStream(chatId: string): string | null {
      const chat = this.chats[chatId]
      if (!chat)
        return null
      const msg: IAiMessage = {
        id: this.createId(),
        role: 'assistant',
        content: '',
        timestamp: Date.now(),
        streaming: true,
      }
      chat.messages.push(msg)
      this.touchChat(chatId)
      return msg.id
    },

    appendAssistantDelta(chatId: string, messageId: string, delta: string) {
      const chat = this.chats[chatId]
      if (!chat || !delta)
        return
      const msg = chat.messages.find(m => m.id === messageId)
      if (!msg)
        return
      msg.content += delta
      this.touchChat(chatId)
    },

    endAssistantStream(chatId: string, messageId: string, fallback?: string) {
      const chat = this.chats[chatId]
      if (!chat)
        return
      const msg = chat.messages.find(m => m.id === messageId)
      if (!msg)
        return
      if (!msg.content.trim() && fallback)
        msg.content = fallback
      msg.streaming = false
      this.touchChat(chatId)
    },

    /**
     * 添加产物到指定会话。
     * - html 类型仅允许 1 个：已存在则原地替换（保留位置）。
     * - 新产物自动成为当前选中 tab。
     */
    addArtifact(chatId: string, artifact: IAiArtifact) {
      const chat = this.chats[chatId]
      if (!chat)
        return
      if (artifact.type === 'html') {
        const idx = chat.artifacts.findIndex(a => a.type === 'html')
        if (idx >= 0)
          chat.artifacts.splice(idx, 1, artifact)
        else
          chat.artifacts.push(artifact)
      }
      else {
        chat.artifacts.push(artifact)
      }
      useAiViewStore().setActiveArtifact(artifact.id)
    },

    removeArtifact(chatId: string, artifactId: string) {
      const chat = this.chats[chatId]
      if (!chat)
        return
      const idx = chat.artifacts.findIndex(a => a.id === artifactId)
      if (idx < 0)
        return
      chat.artifacts.splice(idx, 1)
      const view = useAiViewStore()
      if (view.activeArtifactId === artifactId)
        view.setActiveArtifact(chat.artifacts[0]?.id ?? null)
    },

    async sendTextMessage(text: string): Promise<string | null> {
      const content = text.trim()
      if (!content)
        return null

      const spaceStore = useAiSpaceStore()
      const modelStore = useAiModelStore()
      const agentStore = useAiAgentStore()
      let chatId = this.currentChatId
      const isDraft = chatId === DRAFT_ID

      if (chatId === DRAFT_ID) {
        const spaceId = spaceStore.resolveTargetSpaceId()
        const title = content.slice(0, 16)
        chatId = this.promoteDraft(title, spaceId)
        logger.info({ text: '草稿提升为新会话', data: { chatId, spaceId, title } })
      }

      this.appendUserMessage(chatId, content)
      const assistantId = this.beginAssistantStream(chatId)
      if (!assistantId) {
        logger.error({ text: '创建助手消息失败', data: { chatId } })
        return chatId
      }

      try {
        const agentId = await agentStore.ensureAgent()
        const selected = modelStore.selected
        logger.info({
          text: '发送 AI 消息（流式）',
          data: {
            chatId,
            isDraft,
            agentId,
            modelId: selected.id,
            modelSource: selected.source,
            contentLength: content.length,
          },
        })
        await sendAgentMessageStream(
          {
            agentId,
            content,
            clientMsgId: `cmsg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            modelId: selected.id,
            modelSource: selected.source,
          },
          {
            onDelta: (data) => {
              if (data.content)
                this.appendAssistantDelta(chatId, assistantId, data.content)
            },
            onDone: () => {
              this.endAssistantStream(chatId, assistantId)
              logger.info({ text: 'AI 消息流结束', data: { chatId, assistantId } })
            },
            onError: (data) => {
              this.endAssistantStream(
                chatId,
                assistantId,
                data.message || '发送失败，请稍后重试',
              )
              logger.error({ text: 'AI 消息流错误', data: { chatId, assistantId, message: data.message } })
            },
          },
        )
        // 若流正常结束但未走 done（极端情况），也收尾
        this.endAssistantStream(chatId, assistantId)
      }
      catch (err: any) {
        this.endAssistantStream(
          chatId,
          assistantId,
          err?.message || '发送失败，请稍后重试',
        )
        logger.error({ text: '发送 AI 消息异常', data: { chatId, assistantId, error: err?.message } })
      }

      return chatId
    },

    /**
     * 临时演示产物（接入真实 AI 后删除）：
     * - md 每次新增一个 → 演示「同类型可多 tab」
     * - html 单例替换    → 演示「html 仅 1 个 tab」
     */
    appendDemoArtifacts(chatId: string, content: string) {
      const chat = this.chats[chatId]
      if (!chat)
        return
      const mdCount = chat.artifacts.filter(a => a.type === 'md').length + 1
      this.addArtifact(chatId, {
        id: this.createId(),
        name: `草稿 ${mdCount}`,
        type: 'md',
        content: `# 关于「${content}」\n\n> 占位产物，AI 接入后替换为真实内容。\n\n- 要点一\n- 要点二\n- 要点三\n\n**备注**：本页用于演示右侧面板的多 tab 与类型化渲染。`,
        timestamp: Date.now(),
      })
      this.addArtifact(chatId, {
        id: this.createId(),
        name: '网页预览',
        type: 'html',
        content: `<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:system-ui,-apple-system,sans-serif;padding:32px;color:#2D3436}h1{color:#FF7D45;margin:0 0 12px}p{line-height:1.6;color:#636E72}</style></head><body><h1>「${content}」预览</h1><p>占位 HTML 产物。同一会话仅允许 1 个 html tab，再次产出会替换本页。</p></body></html>`,
        timestamp: Date.now(),
      })
    },
  },
})
