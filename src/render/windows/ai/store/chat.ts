import { defineStore } from 'pinia'
import type { IAiChat, IAiChatListItem, IAiMessage } from 'renderModule/windows/ai/types/chat'

export const useAiChatStore = defineStore('useAiChatStore', {
  state: () => ({
    chatList: [
      {
        id: '1',
        title: '海狸助手',
        timestamp: Date.now(),
      },
    ] as IAiChatListItem[],
    currentChatId: '1',
    chats: {
      '1': {
        id: '1',
        title: '海狸助手',
        timestamp: Date.now(),
        skillId: 'general',
        messages: [
          {
            id: 'welcome',
            role: 'assistant',
            content: '你好，我是海狸 AI 助手。你可以用文字或语音和我交流，也可以从技能商店选择能力后再开始新会话。',
            timestamp: Date.now(),
          },
        ],
      },
    } as Record<string, IAiChat>,
  }),
  getters: {
    isDraftChat(state): boolean {
      return !state.chatList.some(item => item.id === state.currentChatId)
    },
    latestChatId(state): string {
      const sorted = [...state.chatList].sort((a, b) => b.timestamp - a.timestamp)
      return sorted[0]?.id || state.currentChatId
    },
    latestChat(): IAiChat | undefined {
      return this.chats[this.latestChatId]
    },
    currentChat(state): IAiChat | undefined {
      return state.chats[state.currentChatId]
    },
  },
  actions: {
    createId() {
      return `ai_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    },
    selectChat(id: string) {
      if (!this.chats[id])
        return
      this.currentChatId = id
    },
    startNewChat(skillId = 'general') {
      if (this.isDraftChat) {
        const draft = this.chats[this.currentChatId]
        if (draft) {
          draft.messages = []
          draft.skillId = skillId
        }
        return
      }

      const newId = this.createId()
      const now = Date.now()
      this.currentChatId = newId
      this.chats[newId] = {
        id: newId,
        title: '新会话',
        timestamp: now,
        skillId,
        messages: [],
      }
    },
    ensureChatInList(chatId: string, title: string) {
      if (this.chatList.some(item => item.id === chatId))
        return
      this.chatList.unshift({
        id: chatId,
        title,
        timestamp: Date.now(),
      })
    },
    touchChat(id: string) {
      const item = this.chatList.find(c => c.id === id)
      if (item)
        item.timestamp = Date.now()
      if (this.chats[id])
        this.chats[id].timestamp = Date.now()
    },
    appendUserMessage(chatId: string, content: string, fromVoice = false) {
      const chat = this.chats[chatId]
      if (!chat || !content.trim())
        return

      const isFirstMessage = chat.messages.length === 0
      chat.messages.push({
        id: this.createId(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
        fromVoice,
      })

      const title = content.trim().slice(0, 16)
      if (isFirstMessage) {
        chat.title = title
        this.ensureChatInList(chatId, title)
      }
      else if (chat.title === '新会话' || chat.title === '海狸助手') {
        chat.title = title
        const listItem = this.chatList.find(item => item.id === chatId)
        if (listItem)
          listItem.title = title
      }

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
    sendTextMessage(text: string) {
      const content = text.trim()
      if (!content)
        return
      this.appendUserMessage(this.currentChatId, content, false)
      this.appendAssistantReply(
        this.currentChatId,
        `我已收到：「${content}」。AI 服务接入后将在此流式回复。`,
      )
    },
    sendVoiceSegment(text: string) {
      const chatId = this.latestChatId
      this.appendUserMessage(chatId, text, true)
      this.appendAssistantReply(
        chatId,
        `关于「${text}」，这是语音回复。接入 TTS 后将直接播报，并写入当前会话记录。`,
      )
    },
  },
})
