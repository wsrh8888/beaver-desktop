<template>
  <div class="call-footer" :class="{ 'overlay': hasVideo }">
    <!-- 静音 -->
    <div class="action-item" :class="{ active: callStore.callStatus.isMuted }" @click="handleToggleMute">
      <div class="icon-circle">
        <img v-if="callStore.callStatus.isMuted" src="renderModule/assets/image/call/mute_on.svg" alt="取消静音">
        <img v-else src="renderModule/assets/image/call/mute.svg" alt="静音">
      </div>
      <span>{{ callStore.callStatus.isMuted ? '取消静音' : '静音' }}</span>
    </div>

    <!-- 摄像头 -->
    <div class="action-item" :class="{ active: !callStore.callStatus.isCameraOff }" @click="handleToggleCamera">
      <div class="icon-circle">
        <img v-if="callStore.callStatus.isCameraOff" src="renderModule/assets/image/call/video_off.svg" alt="开启视频">
        <img v-else src="renderModule/assets/image/call/video.svg" alt="关闭视频">
      </div>
      <span>{{ callStore.callStatus.isCameraOff ? '开启视频' : '关闭视频' }}</span>
    </div>

    <!-- 挂断 -->
    <div class="action-item hangup" @click="handleHangup">
      <div class="icon-circle">
        <img src="renderModule/assets/image/call/hangup.svg" alt="挂断">
      </div>
      <span>{{ isWaiting ? '取消' : '挂断' }}</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { usecallStore } from '../pinia/call'
import callManager from '../core'

export default defineComponent({
  name: 'CallFooter',
  setup() {
    const callStore = usecallStore()

    const isWaiting = computed(() => callStore.callStatus.phase === 'calling')

    // 是否有视频 (本地或远程有视频轨道即视为视频模式)
    const hasVideo = computed(() => {
      // 检查 store 中的视频轨道
      return (callStore.remoteVideoTracks && callStore.remoteVideoTracks.length > 0) ||
        (callStore.localVideoTrack !== null)
    })

    const handleToggleMute = () => {
      callManager.toggleMute()
    }

    const handleToggleCamera = () => {
      callManager.toggleCamera()
    }

    const handleHangup = () => {
      callManager.hangup()
    }

    return {
      callStore,
      isWaiting,
      hasVideo,
      handleToggleMute,
      handleToggleCamera,
      handleHangup
    }
  }
})
</script>

<style lang="less" scoped>
.call-footer {
  padding: 30px 20px 40px;
  display: flex;
  justify-content: center;
  gap: 50px;
  background: #16213e;
  /* 默认背景，与底部渐变一致 */
  z-index: 20;
  flex-shrink: 0;

  &.overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  }

  .action-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    cursor: pointer;

    .icon-circle {
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s;

      img {
        width: 28px;
        height: 28px;
        filter: invert(1);
      }
    }

    &.active .icon-circle {
      background: rgba(255, 255, 255, 0.3);
    }

    &.hangup .icon-circle {
      background: #ff5252;
      box-shadow: 0 4px 15px rgba(255, 82, 82, 0.4);
    }

    &:hover .icon-circle {
      transform: scale(1.1);
    }

    span {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.8);
    }
  }
}
</style>
