<template>
  <div class="call-footer">
    <div class="control-group">
      <!-- 静音 -->
      <div class="control-btn" :class="{ active: isMuted }" @click="$emit('mute')">
        <div class="icon-circle">
          <img
            :src="isMuted ? 'renderModule/assets/image/call/mute_active.svg' : 'renderModule/assets/image/call/mute.svg'"
            alt="静音">
        </div>
        <span>{{ isMuted ? '取消静音' : '静音' }}</span>
      </div>

      <!-- 摄像头 (视频通话或任何群聊) -->
      <div v-if="callStore.callType === 2 || callStore.callType === 3 || callStore.callType === 4" class="control-btn"
        :class="{ active: !isCameraOff }" @click="$emit('camera')">
        <div class="icon-circle">
          <img
            :src="isCameraOff ? 'renderModule/assets/image/call/video_off.svg' : 'renderModule/assets/image/call/video.svg'"
            alt="摄像头">
        </div>
        <span>{{ isCameraOff ? '开启摄像头' : '关闭摄像头' }}</span>
      </div>

      <!-- 邀请成员 (仅群聊/会议模式) -->
      <div v-if="!isPrivate" class="control-btn" @click="$emit('invite')">
        <div class="icon-circle">
          <img src="renderModule/assets/image/call/add_member.svg" alt="邀请">
        </div>
        <span>邀请</span>
      </div>

      <!-- 挂断 -->
      <div class="control-btn hangup" @click="$emit('hangup')">
        <div class="icon-circle red">
          <img src="renderModule/assets/image/call/hangup.svg" alt="挂断">
        </div>
        <span>挂断</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { usecallStore } from 'renderModule/windows/call/pinia/call'

export default defineComponent({
  name: 'ActionButtons',
  props: {
    isMuted: {
      type: Boolean,
      default: false
    },
    isCameraOff: {
      type: Boolean,
      default: false
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  },
  emits: ['mute', 'camera', 'hangup', 'invite'],
  setup() {
    const callStore = usecallStore()
    return {
      callStore
    }
  }
})
</script>

<style lang="less" scoped>
.call-footer {
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10;

  .control-group {
    display: flex;
    gap: 40px;

    .control-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 10px;
      cursor: pointer;
      font-size: 12px;
      color: #b2bec3;

      &:hover .icon-circle {
        background: rgba(255, 255, 255, 0.2);
      }

      &.active .icon-circle {
        background: #ff7d45;
        color: #fff;
      }

      .icon-circle {
        width: 56px;
        height: 56px;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        img {
          width: 24px;
          height: 24px;
          filter: invert(1);
        }

        &.red {
          background: #ff5252;
        }
      }

      &.hangup:hover .icon-circle {
        background: #ff5252;
        opacity: 0.8;
      }
    }
  }
}
</style>
