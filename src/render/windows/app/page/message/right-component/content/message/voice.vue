<template>
  <div
    class="voice-message"
    :style="{ width: `${bubbleWidth}px` }"
    @click.stop="handlePlay"
  >
    <div class="voice-content" :class="{ 'is-self': isSelf }">
      <div class="voice-icon" :class="{ 'voice-playing': isPlaying, 'voice-icon-sent': isSelf }">
        <template v-if="isPlaying">
          <img class="voice-layer" :src="wedgeIcon" alt="">
          <img class="voice-layer voice-wave-2" :src="arc2Icon" alt="">
          <img class="voice-layer voice-wave-3" :src="arc3Icon" alt="">
        </template>
        <img v-else class="voice-layer voice-layer-full" :src="fullIcon" alt="">
      </div>
      <span class="voice-duration">{{ durationLabel }}</span>
    </div>
    <span v-if="!isSelf && !hasPlayed" class="voice-unread" />
  </div>
</template>

<script lang="ts">
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import { AudioPlayer, audioPlayerState } from 'renderModule/core/media/audio'
import { useMessageMediaStore } from 'renderModule/windows/app/pinia/message/message-media'
import { computed, defineComponent, PropType, toRefs } from 'vue'

import voiceIconDark from 'renderModule/assets/image/chat/voice-icon-dark.svg'
import voiceIconLight from 'renderModule/assets/image/chat/voice-icon-light.svg'
import voiceWedgeDark from 'renderModule/assets/image/chat/voice-wedge-dark.svg'
import voiceWedgeLight from 'renderModule/assets/image/chat/voice-wedge-light.svg'
import voiceArc2Dark from 'renderModule/assets/image/chat/voice-arc2-dark.svg'
import voiceArc2Light from 'renderModule/assets/image/chat/voice-arc2-light.svg'
import voiceArc3Dark from 'renderModule/assets/image/chat/voice-arc3-dark.svg'
import voiceArc3Light from 'renderModule/assets/image/chat/voice-arc3-light.svg'

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
    messageId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const { playingMessageId } = toRefs(audioPlayerState)
    const messageMediaStore = useMessageMediaStore()

    const fileUrl = computed(() => props.msg.voiceMsg?.fileUrl || '')

    const playbackId = computed(() => {
      if (props.messageId)
        return props.messageId
      const url = fileUrl.value
      return url ? `voice-url:${url}` : ''
    })

    const durationSec = computed(() => {
      const raw = props.msg.voiceMsg?.duration
      if (typeof raw === 'number' && raw > 0)
        return Math.round(raw)
      return 1
    })

    const bubbleWidth = computed(() => {
      return Math.min(200, Math.max(80, 80 + durationSec.value * 6))
    })

    const durationLabel = computed(() => `${durationSec.value}"`)

    const fullIcon = computed(() => props.isSelf ? voiceIconLight : voiceIconDark)
    const wedgeIcon = computed(() => props.isSelf ? voiceWedgeLight : voiceWedgeDark)
    const arc2Icon = computed(() => props.isSelf ? voiceArc2Light : voiceArc2Dark)
    const arc3Icon = computed(() => props.isSelf ? voiceArc3Light : voiceArc3Dark)

    const isPlaying = computed(() => {
      return !!playbackId.value && playingMessageId.value === playbackId.value
    })

    const hasPlayed = computed(() => {
      if (props.isSelf)
        return true
      return messageMediaStore.isPlayed(playbackId.value)
    })

    const handlePlay = async () => {
      const id = playbackId.value
      const url = fileUrl.value
      if (!id || !url)
        return

      await AudioPlayer.toggleVoice(id, url)
    }

    return {
      bubbleWidth,
      durationLabel,
      fullIcon,
      wedgeIcon,
      arc2Icon,
      arc3Icon,
      isPlaying,
      hasPlayed,
      handlePlay,
    }
  },
})
</script>

<style lang="less" scoped>
.voice-message {
  position: relative;
  cursor: pointer;
  user-select: none;
}

.voice-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 2px 0;
  width: 100%;

  &.is-self {
    flex-direction: row-reverse;
  }
}

.voice-icon {
  position: relative;
  width: 18px;
  height: 18px;
  flex-shrink: 0;

  &.voice-icon-sent {
    transform: scaleX(-1);
  }

  .voice-layer {
    position: absolute;
    top: 0;
    left: 0;
    width: 18px;
    height: 18px;
    display: block;
  }

  .voice-layer-full {
    position: static;
  }

  &.voice-playing {
    .voice-wave-2 {
      animation: voiceWave2 1s infinite;
    }

    .voice-wave-3 {
      animation: voiceWave3 1s infinite;
    }
  }
}

.voice-duration {
  font-size: 14px;
  font-weight: 400;
  color: inherit;
  line-height: 1;
  flex-shrink: 0;
}

.voice-unread {
  position: absolute;
  top: 50%;
  left: 100%;
  margin-left: 10px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: #e75e58;
  transform: translateY(-50%);
}

@keyframes voiceWave2 {
  0%,
  33% {
    opacity: 0;
  }

  34%,
  100% {
    opacity: 1;
  }
}

@keyframes voiceWave3 {
  0%,
  66% {
    opacity: 0;
  }

  67%,
  100% {
    opacity: 1;
  }
}
</style>
