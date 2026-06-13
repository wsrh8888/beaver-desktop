import { defineStore } from 'pinia'

export const useMessageMediaStore = defineStore('useMessageMediaStore', {
  state: () => ({
    playedMessageIds: [] as string[],
    localOnlyPlayedIds: [] as string[],
  }),

  getters: {
    isPlayed: state => (messageId: string) => {
      if (!messageId)
        return false
      return state.playedMessageIds.includes(messageId)
        || state.localOnlyPlayedIds.includes(messageId)
    },
  },

  actions: {
    async init() {
      try {
        const result = await electron.database.chat.getMessageMediaIds()
        this.playedMessageIds = result.messageIds || []
      }
      catch (error) {
        console.error('[MessageMediaStore] 加载消息媒体状态失败:', error)
      }
    },

    mark(messageId: string, options?: { localOnly?: boolean }) {
      if (!messageId)
        return

      if (options?.localOnly) {
        if (!this.localOnlyPlayedIds.includes(messageId))
          this.localOnlyPlayedIds.push(messageId)
        return
      }

      if (!this.playedMessageIds.includes(messageId))
        this.playedMessageIds.push(messageId)
    },

    merge(messageIds: string[]) {
      if (!messageIds?.length)
        return

      const set = new Set(this.playedMessageIds)
      for (const id of messageIds) {
        if (id)
          set.add(id)
      }
      this.playedMessageIds = Array.from(set)
    },
  },
})
