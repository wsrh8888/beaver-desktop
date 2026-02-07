<template>
  <div class="call-content">
    <div class="member-container">
      <!-- 成员列表/网格 -->
      <div class="member-grid" :class="gridClass">
        <div v-for="member in callMembers" :key="member.id" class="member-item">
          <!-- 视频层 -->
          <div v-if="cameraEnabled" class="video-layer">
            <video :ref="el => setVideoRef(el, member.id)" autoplay playsinline></video>
          </div>

          <!-- 头像层 (语音模式或摄像头关闭时显示) -->
          <div v-else class="avatar-layer">
            <div class="avatar-wrapper" :class="{ pulse: member.isSpeaking }">
              <img :src="member.avatar" :alt="member.name">
            </div>
            <div class="member-info">
              <span class="name">{{ member.name }}</span>
              <!-- 状态描述 -->
              <div class="member-status">
                <span v-if="callStore.callStatus.phase === 'incoming'" class="status-text incoming">收到通话邀请...</span>
                <span v-else-if="callStore.callStatus.phase === 'active' && member.isSpeaking"
                  class="status-text speaking">正在发言</span>
                <span v-else-if="callStore.callStatus.phase === 'calling'" class="status-text calling">正在呼叫对方...</span>
                <span v-else-if="callStore.callStatus.phase === 'active'" class="status-text">已连接</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue'
import { usecallStore } from '../pinia/call'

export default defineComponent({
  name: 'CallContent',
  setup() {
    const callStore = usecallStore()
    const videoRefs = ref<Record<string, HTMLVideoElement>>({})

    const setVideoRef = (el: any, id: string) => {
      if (el) videoRefs.value[id] = el as HTMLVideoElement
    }

    // 这里先写死一些模拟数据，后续对接真实流
    const callMembers = computed(() => {
      // 从 store 获取基础数据
      const { targetId, callType } = callStore.baseInfo

      const members = []

      // 1. 对于私聊，固定显示 2 个人 (自己 + 对方)
      if (callType === 'private') {
        // 自己 (后续从全局 store 获取个人信息)
        members.push({
          id: 'me',
          name: '我',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          isSpeaking: false
        })

        // 对方
        members.push({
          id: targetId[0] || 'remote',
          name: '对方用户',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lucky',
          isSpeaking: false
        })
      }
      // 2. 对于群聊，初始只有自己，后续动态加人
      else {
        members.push({
          id: 'me',
          name: '我',
          avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
          isSpeaking: false
        })
        // TODO: 从 LiveKit 获取其他参与者
      }

      return members
    })

    const cameraEnabled = computed(() => {
      return !callStore.callStatus.isCameraOff
    })

    const isConnecting = computed(() => {
      return false // TODO: 连接状态
    })

    const gridClass = computed(() => {
      const count = callMembers.value.length
      if (count <= 1) return 'grid-1'
      return 'grid-multi'
    })

    return {
      callStore,
      callMembers,
      cameraEnabled,
      isConnecting,
      gridClass,
      setVideoRef
    }
  }
})
</script>

<style lang="less" scoped>
.call-content {
  flex: 1;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;

  .member-container {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .member-grid {
    width: 100%;
    height: 100%;
    display: grid;
    gap: 20px;
    padding: 20px;

    &.grid-1 {
      max-width: 600px;
      max-height: 400px;
      grid-template-columns: 1fr;
    }

    &.grid-multi {
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      max-width: 1000px;
    }
  }

  .member-item {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 16px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;

    .video-layer {
      width: 100%;
      height: 100%;

      video {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .avatar-layer {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 20px;

      .avatar-wrapper {
        width: 120px;
        height: 120px;
        border-radius: 50%;
        overflow: hidden;
        border: 4px solid #ff7d45;
        box-shadow: 0 0 30px rgba(255, 125, 69, 0.2);

        &.pulse {
          animation: avatar-pulse 2s infinite;
        }

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .member-info {
        text-align: center;

        .name {
          display: block;
          font-size: 20px;
          font-weight: 500;
          color: #fff;
          margin-bottom: 4px;
        }

        .status-text {
          font-size: 14px;
          color: #b2bec3;

          &.incoming {
            color: #00b894;
            font-weight: 500;
          }

          &.calling {
            color: #ff7d45;
          }

          &.speaking {
            color: #ff7d45;
            padding: 2px 8px;
            background: rgba(255, 125, 69, 0.1);
            border-radius: 4px;
          }
        }
      }
    }
  }

  @keyframes avatar-pulse {
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
}
</style>
