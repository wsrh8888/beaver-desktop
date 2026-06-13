import { CacheType } from 'commonModule/type/cache/cache'
import { markMessageMediaApi } from 'renderModule/api/chat'
import { useMessageMediaStore } from 'renderModule/windows/app/pinia/message/message-media'
import { ref } from 'vue'

let currentAudio: HTMLAudioElement | null = null

export const audioPlayerState = {
  playingMessageId: ref<string | null>(null),
}

function isRealMessageId(messageId: string) {
  return !!messageId && !messageId.startsWith('voice-url:')
}

async function markVoicePlayed(messageId: string) {
  const messageMediaStore = useMessageMediaStore()
  const localOnly = !isRealMessageId(messageId)

  messageMediaStore.mark(messageId, { localOnly })

  if (localOnly)
    return

  try {
    await markMessageMediaApi({ messageIds: [messageId] })
  }
  catch (error) {
    console.error('[AudioPlayer] 标记语音已播放失败:', error)
  }
}

async function resolveUrl(fileUrl: string) {
  if (!fileUrl)
    return ''

  try {
    const cached = await electron.cache.get(CacheType.USER_IMAGE, fileUrl)
    return cached || fileUrl
  }
  catch {
    return fileUrl
  }
}

export class AudioPlayer {
  static async toggleVoice(messageId: string, fileUrl: string) {
    if (!messageId || !fileUrl)
      return

    const audioUrl = await resolveUrl(fileUrl)
    if (!audioUrl)
      return

    if (audioPlayerState.playingMessageId.value === messageId && currentAudio && !currentAudio.paused) {
      this.stop()
      return
    }

    this.stop()

    const audio = new Audio(audioUrl)
    currentAudio = audio
    audioPlayerState.playingMessageId.value = messageId

    audio.onended = () => {
      if (currentAudio === audio)
        this.stop()
    }
    audio.onerror = () => {
      if (currentAudio === audio)
        this.stop()
    }

    try {
      await audio.play()
      await markVoicePlayed(messageId)
    }
    catch {
      if (currentAudio === audio)
        this.stop()
    }
  }

  static stop() {
    if (!currentAudio)
      return

    const audio = currentAudio
    currentAudio = null
    audioPlayerState.playingMessageId.value = null
    audio.onended = null
    audio.onerror = null
    audio.pause()
    audio.removeAttribute('src')
    audio.load()
  }

  static async play(fileUrl: string, title: string) {
    if (!fileUrl)
      return

    const audioUrl = await resolveUrl(fileUrl)
    await electron.window.openWindow('audio', {
      unique: true,
      params: {
        url: audioUrl,
        title,
      },
    })
  }
}
