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
