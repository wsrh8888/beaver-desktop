<template>
  <div class="audio-player">
    <div v-if="audioUrl" class="player-container">
      <div class="player-header">
        <div class="audio-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 3V12M12 12C10.3431 12 9 13.3431 9 15C9 16.6569 10.3431 18 12 18C13.6569 18 15 16.6569 15 15C15 13.3431 13.6569 12 12 12Z" stroke="#FF7D45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M19 10V14M17 12H21" stroke="#FF7D45" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div v-if="audioTitle" class="audio-title">
          {{ audioTitle }}
        </div>
        <div v-else class="audio-title">
          音频文件
        </div>
      </div>

      <div class="player-controls">
        <audio
          ref="audioRef"
          :src="audioUrl"
          class="player-audio"
          @loadedmetadata="handleLoadedMetadata"
          @timeupdate="handleTimeUpdate"
          @ended="handleEnded"
          @error="handleAudioError"
        />

        <div class="progress-container">
          <div class="time-display">
            <span>{{ formatTime(currentTime) }}</span>
            <span>{{ formatTime(duration) }}</span>
          </div>
          <div class="progress-bar" @click="handleProgressClick">
            <div class="progress-bg">
              <div class="progress-fill" :style="{ width: `${progressPercent}%` }" />
              <div class="progress-dot" :style="{ left: `${progressPercent}%` }" />
            </div>
          </div>
        </div>

        <div class="control-buttons">
          <button class="control-btn" @click="togglePlay">
            <svg v-if="isPlaying" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="6" y="4" width="4" height="16" fill="currentColor" />
              <rect x="14" y="4" width="4" height="16" fill="currentColor" />
            </svg>
            <svg v-else width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 5V19L19 12L8 5Z" fill="currentColor" />
            </svg>
          </button>
          <button class="control-btn" @click="seekBackward">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11 18V6L4 12L11 18Z" fill="currentColor" />
              <path d="M18 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
          <button class="control-btn" @click="seekForward">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M13 18V6L20 12L13 18Z" fill="currentColor" />
              <path d="M6 6V18" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <p>未找到音频</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, onUnmounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'AudioPlayer',
  props: {
    audioUrl: {
      type: String,
      default: '',
    },
    audioTitle: {
      type: String,
      default: '',
    },
  },
  setup() {
    const audioRef = ref<HTMLAudioElement | null>(null)
    const isPlaying = ref(false)
    const currentTime = ref(0)
    const duration = ref(0)
    const progressPercent = ref(0)
    const isDragging = ref(false)

    const handleLoadedMetadata = () => {
      if (audioRef.value) {
        duration.value = audioRef.value.duration
      }
    }

    const handleTimeUpdate = () => {
      if (audioRef.value && !isDragging.value) {
        currentTime.value = audioRef.value.currentTime
        if (duration.value > 0) {
          progressPercent.value = (currentTime.value / duration.value) * 100
        }
      }
    }

    const handleEnded = () => {
      isPlaying.value = false
      currentTime.value = 0
      progressPercent.value = 0
    }

    const handleAudioError = (e: Event) => {
      console.error('音频加载失败', e)
    }

    const togglePlay = () => {
      if (!audioRef.value)
        return

      if (isPlaying.value) {
        audioRef.value.pause()
        isPlaying.value = false
      }
      else {
        audioRef.value.play()
        isPlaying.value = true
      }
    }

    const seekBackward = () => {
      if (audioRef.value) {
        audioRef.value.currentTime = Math.max(0, audioRef.value.currentTime - 10)
      }
    }

    const seekForward = () => {
      if (audioRef.value) {
        audioRef.value.currentTime = Math.min(
          duration.value,
          audioRef.value.currentTime + 10,
        )
      }
    }

    const handleProgressClick = (e: MouseEvent) => {
      if (!audioRef.value || !duration.value)
        return

      const progressBar = e.currentTarget as HTMLElement
      const rect = progressBar.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percent = clickX / rect.width
      const newTime = percent * duration.value

      audioRef.value.currentTime = newTime
      currentTime.value = newTime
      progressPercent.value = percent * 100
    }

    const formatTime = (seconds: number): string => {
      if (Number.isNaN(seconds) || !Number.isFinite(seconds))
        return '00:00'
      const mins = Math.floor(seconds / 60)
      const secs = Math.floor(seconds % 60)
      return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // 键盘事件
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        electron?.window.closeWindow('audio', { hideOnly: true })
      }
      else if (e.key === ' ') {
        e.preventDefault()
        togglePlay()
      }
      else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        seekBackward()
      }
      else if (e.key === 'ArrowRight') {
        e.preventDefault()
        seekForward()
      }
    }

    watch(() => isPlaying.value, (playing) => {
      if (audioRef.value) {
        if (playing) {
          audioRef.value.play().catch(console.error)
        }
        else {
          audioRef.value.pause()
        }
      }
    })

    onMounted(() => {
      window.addEventListener('keydown', handleKeyDown)
    })

    onUnmounted(() => {
      window.removeEventListener('keydown', handleKeyDown)
      if (audioRef.value) {
        audioRef.value.pause()
      }
    })

    return {
      audioRef,
      isPlaying,
      currentTime,
      duration,
      progressPercent,
      handleLoadedMetadata,
      handleTimeUpdate,
      handleEnded,
      handleAudioError,
      togglePlay,
      seekBackward,
      seekForward,
      handleProgressClick,
      formatTime,
    }
  },
})
</script>

<style lang="less" scoped>
.audio-player {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.player-container {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 32px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.player-header {
  text-align: center;
  margin-bottom: 32px;
}

.audio-icon {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}

.audio-title {
  font-size: 16px;
  font-weight: 500;
  color: #2D3436;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.progress-container {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.time-display {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #636E72;
}

.progress-bar {
  cursor: pointer;
  padding: 8px 0;
}

.progress-bg {
  position: relative;
  height: 4px;
  background: #EBEEF5;
  border-radius: 2px;
  overflow: visible;
}

.progress-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  background: #FF7D45;
  border-radius: 2px;
  transition: width 0.1s linear;
}

.progress-dot {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #FF7D45;
  border-radius: 50%;
  border: 2px solid #FFFFFF;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: left 0.1s linear;
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 24px;
  margin-top: 8px;
}

.control-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  background: #F9FAFB;
  color: #FF7D45;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;

  &:hover {
    background: #FFE6D9;
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.95);
  }

  svg {
    width: 24px;
    height: 24px;
  }
}

.player-audio {
  display: none;
}

.empty-state {
  text-align: center;
  color: #636E72;
  font-size: 14px;
}
</style>
