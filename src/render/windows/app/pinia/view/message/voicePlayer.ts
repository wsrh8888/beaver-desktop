import { defineStore } from 'pinia'

let currentAudio: HTMLAudioElement | null = null

export const useVoicePlayerStore = defineStore('voicePlayer', {
  state: () => ({
    /** 当前正在播放的语音 fileUrl */
    playingFileUrl: null as string | null,
    /** 已播放过的语音 fileUrl（用于隐藏未读红点） */
    playedFileUrls: [] as string[],
  }),

  getters: {
    isPlaying: state => (fileUrl: string) => state.playingFileUrl === fileUrl,
    hasPlayed: state => (fileUrl: string) => state.playedFileUrls.includes(fileUrl),
  },

  actions: {
    async toggle(fileUrl: string, audioUrl: string) {
      if (!fileUrl || !audioUrl)
        return

      if (this.playingFileUrl === fileUrl && currentAudio && !currentAudio.paused) {
        this.stop()
        return
      }

      this.stop()

      const audio = new Audio(audioUrl)
      currentAudio = audio
      this.playingFileUrl = fileUrl
      this.markPlayed(fileUrl)

      audio.onended = () => this.stop()
      audio.onerror = () => this.stop()

      try {
        await audio.play()
      }
      catch {
        this.stop()
      }
    },

    stop() {
      if (currentAudio) {
        currentAudio.pause()
        currentAudio.src = ''
        currentAudio = null
      }
      this.playingFileUrl = null
    },

    markPlayed(fileUrl: string) {
      if (fileUrl && !this.playedFileUrls.includes(fileUrl))
        this.playedFileUrls.push(fileUrl)
    },
  },
})
