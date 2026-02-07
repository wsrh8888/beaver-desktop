<template>
  <div class="audio-status">
    <div class="avatar-group">
      <div class="avatar-item large pulse">
        <img :src="callStore.targetAvatar" alt="头像">
      </div>
    </div>
    <div class="call-info">
      <h2 class="nick-name">{{ callStore.targetName }}</h2>
      <p class="status-text">{{ callStore.statusText }}</p>
      <p v-if="callStore.isConnected" class="timer">{{ formatDuration(duration) }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { usecallStore } from 'renderModule/windows/call/pinia/call'
import { formatDuration } from 'renderModule/windows/call/utils'

export default defineComponent({
  name: 'AudioCall',
  props: {
    duration: {
      type: Number,
      default: 0
    }
  },
  setup() {
    const callStore = usecallStore()
    return {
      callStore,
      formatDuration
    }
  }
})
</script>

<style lang="less" scoped>
.audio-status {
  text-align: center;

  .avatar-group {
    margin-bottom: 30px;
    display: flex;
    justify-content: center;

    .avatar-item {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      overflow: hidden;
      border: 4px solid #ff7d45;
      box-shadow: 0 0 20px rgba(255, 125, 69, 0.3);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      &.pulse {
        animation: pulse 2s infinite;
      }
    }
  }

  .call-info {
    .nick-name {
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 8px;
    }

    .status-text {
      font-size: 16px;
      color: #b2bec3;
      margin-bottom: 12px;
    }

    .timer {
      font-size: 20px;
      font-weight: 500;
      color: #ff7d45;
    }
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 125, 69, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 20px rgba(255, 125, 69, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(255, 125, 69, 0);
  }
}
</style>
