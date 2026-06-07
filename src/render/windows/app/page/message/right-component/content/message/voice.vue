<template>
  <div
    class="voice-message"
    :class="{ 'is-self': isSelf, 'is-playing': isPlaying }"
    :style="{ width: `${bubbleWidth}px` }"
    @click.stop="handlePlay"
  >
    <div class="voice-waves" :class="{ playing: isPlaying, reverse: isSelf }">
      <span class="wave-bar" />
      <span class="wave-bar" />
      <span class="wave-bar" />
    </div>
    <span class="voice-duration">{{ durationLabel }}</span>
    <span v-if="!isSelf && !hasPlayed" class="voice-unread" />
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import { useVoicePlayerStore } from 'renderModule/windows/app/pinia/view/message/voicePlayer'
import { computed, defineComponent, PropType } from 'vue'
import { storeToRefs } from 'pinia'

export default defineComponent({
  name: 'VoiceMessage',
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
    isSelf: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const voicePlayerStore = useVoicePlayerStore()
    const { playingFileUrl, playedFileUrls } = storeToRefs(voicePlayerStore)

    const fileUrl = computed(() => props.msg.voiceMsg?.fileUrl || '')

    const durationSec = computed(() => {
      const raw = props.msg.voiceMsg?.duration
      if (typeof raw === 'number' && raw > 0)
        return Math.round(raw)
      return 1
    })

    const bubbleWidth = computed(() => {
      return Math.min(200, Math.max(96, 72 + durationSec.value * 6))
    })

    const durationLabel = computed(() => `${durationSec.value}″`)

    const isPlaying = computed(() => {
      const url = fileUrl.value
      return !!url && playingFileUrl.value === url
    })

    const hasPlayed = computed(() => {
      if (props.isSelf)
        return true
      const url = fileUrl.value
      return !!url && playedFileUrls.value.includes(url)
    })

    const resolveAudioUrl = async () => {
      const url = fileUrl.value
      if (!url)
        return ''

      try {
        const cached = await electron.cache.get(CacheType.USER_IMAGE, url)
        return cached || url
      }
      catch {
        return url
      }
    }

    const handlePlay = async () => {
      const url = fileUrl.value
      if (!url)
        return

      const audioUrl = await resolveAudioUrl()
      if (!audioUrl)
        return

      await voicePlayerStore.toggle(url, audioUrl)
    }

    return {
      bubbleWidth,
      durationLabel,
      isPlaying,
      hasPlayed,
      handlePlay,
    }
  },
})
</script>

<style lang="less" scoped>
.voice-message {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 36px;
  padding: 6px 4px;
  cursor: pointer;
  user-select: none;
  position: relative;

  &.is-self {
    flex-direction: row-reverse;
  }
}

.voice-duration {
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  line-height: 1;
  flex-shrink: 0;
}

.voice-waves {
  display: flex;
  align-items: center;
  gap: 3px;
  width: 20px;
  height: 20px;
  flex-shrink: 0;

  &.reverse {
    flex-direction: row-reverse;
  }

  .wave-bar {
    display: block;
    width: 3px;
    height: 8px;
    border-radius: 2px;
    background-color: #fff;
    opacity: 0.85;
    transform-origin: center bottom;
  }

  &.playing .wave-bar {
    animation: voiceWave 1s ease-in-out infinite;

    &:nth-child(1) {
      animation-delay: 0s;
    }

    &:nth-child(2) {
      animation-delay: 0.15s;
    }

    &:nth-child(3) {
      animation-delay: 0.3s;
    }
  }
}

.voice-unread {
  position: absolute;
  top: 50%;
  right: -10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #ff4d4f;
  transform: translateY(-50%);
}

@keyframes voiceWave {
  0%,
  100% {
    height: 8px;
    opacity: 0.6;
  }

  50% {
    height: 16px;
    opacity: 1;
  }
}
</style>
