<template>
  <div class="voice-message" :class="{ 'is-playing': isPlaying }" @click="handleClick">
    <!-- 播放/暂停图标 -->
    <div class="voice-play-icon">
      <svg v-if="!isPlaying" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polygon points="5 3 19 12 5 21 5 3" />
      </svg>
      <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="6" y="4" width="4" height="16" />
        <rect x="14" y="4" width="4" height="16" />
      </svg>
    </div>
    <!-- 波形显示（播放时动画） -->
    <div class="voice-waves">
      <div v-for="i in 5" :key="i" class="wave-bar" :class="{ active: isPlaying }" />
    </div>
    <!-- 时长显示 -->
    <div class="voice-duration">
      {{ formatDuration(duration) }}
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'VoiceMessage',
  props: {
    fileName: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      default: 0,
    },
    messageId: {
      type: String,
      required: true,
    },
    isPlaying: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['play', 'pause'],
  setup(props, { emit }) {
    const handleClick = () => {
      if (props.isPlaying) {
        emit('pause')
      }
      else {
        emit('play')
      }
    }

    // 格式化时长（秒 -> mm:ss）
    const formatDuration = (seconds: number): string => {
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    return {
      handleClick,
      formatDuration,
    }
  },
})
</script>

<style lang="less" scoped>
.voice-message {
  min-width: 120px;
  max-width: 240px;
  display: flex;
  align-items: center;
  padding: 8px 12px;
  background-color: #fff;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.2s;
  user-select: none;

  &:hover {
    background-color: #f5f5f5;
  }

  &.is-playing {
    background-color: #fff5f0;

    .voice-play-icon {
      color: #FF7D45;
    }
  }

  .voice-play-icon {
    width: 24px;
    height: 24px;
    margin-right: 8px;
    color: #666;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s;

    svg {
      width: 100%;
      height: 100%;
    }
  }

  &:hover .voice-play-icon {
    color: #FF7D45;
  }

  .voice-waves {
    display: flex;
    align-items: center;
    gap: 3px;
    flex: 1;
    height: 20px;
    margin-right: 8px;

    .wave-bar {
      width: 3px;
      height: 12px;
      background-color: #999;
      border-radius: 2px;
      transition: height 0.3s ease;

      &.active {
        animation: waveAnimation 1s ease-in-out infinite;
        background-color: #FF7D45;
      }

      &:nth-child(1) { animation-delay: 0s; }
      &:nth-child(2) { animation-delay: 0.1s; }
      &:nth-child(3) { animation-delay: 0.2s; }
      &:nth-child(4) { animation-delay: 0.3s; }
      &:nth-child(5) { animation-delay: 0.4s; }
    }
  }

  .voice-duration {
    font-size: 12px;
    color: #666;
    min-width: 35px;
    text-align: right;
    flex-shrink: 0;
  }
}

@keyframes waveAnimation {
  0%, 100% {
    height: 8px;
  }
  50% {
    height: 16px;
  }
}
</style>

