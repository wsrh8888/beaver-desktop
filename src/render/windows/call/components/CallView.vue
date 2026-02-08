<template>
  <div class="active-view">
    <!-- 统一视频网格 (始终显示，包含本地和远程) -->
    <div class="video-container">
      <div class="video-grid" :class="gridClass" :style="gridStyle">
        <div v-for="item in allTracks" :key="item.sid" class="grid-item">
          <!-- 视频画面 -->
          <div v-if="!item.isCameraOff && item.track" class="video-wrapper">
            <VideoRenderer :track="item.track" :is-local="item.isLocal" />
          </div>

          <!-- 占位图 (摄像头关闭或呼叫等待中) -->
          <div v-else class="camera-off-placeholder">
            <div class="avatar-box" :class="{ 'pulse': item.status === 'calling' }">
              <BeaverImage v-if="item.avatar" :file-name="item.avatar" image-class="placeholder-avatar"
                :cache-type="CacheType.USER_AVATAR" />
              <img v-else :src="defaultAvatar" class="placeholder-avatar">
            </div>
            <div v-if="item.statusHint" class="status-hint">{{ item.statusHint }}</div>
          </div>

          <!-- 用户标签 -->
          <div class="user-info-tag">
            <span class="name">{{ item.identity }}</span>
            <span v-if="item.isMuted" class="status-icon">🔇</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { CacheType } from 'commonModule/type/cache/cache'
import { usecallStore } from '../pinia/call'
import VideoRenderer from './VideoRenderer.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

export default defineComponent({
  name: 'CallView',
  components: {
    VideoRenderer,
    BeaverImage
  },
  setup() {
    const callStore = usecallStore()
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'


    // 汇总所有展示项
    const allTracks = computed(() => {
      const list: any[] = []

      // 基于 members (唯一事实来源) 驱动网格
      callStore.members.forEach(member => {
        const userId = member.userId

        // 判定是否是本地用户画面
        const isMe = userId === callStore.myUserId

        const remoteTrack = !isMe ? callStore.remoteVideoTracks.find(t => t.identity === userId) : null

        // 计算展示状态
        let statusHint = ''
        if (member.status === 'calling') statusHint = '等待接听...'
        if (member.status === 'left') statusHint = '已离开'
        if (member.status === 'rejected') statusHint = '已拒绝'
        if (member.status === 'busy') statusHint = '忙碌中'

        list.push({
          sid: remoteTrack?.sid || `slot-${userId}`,
          userId: userId,
          identity: member.nickName || userId,
          track: isMe ? callStore.localVideoTrack : remoteTrack?.track || null,
          isLocal: isMe,
          isMuted: isMe ? callStore.callStatus.isMuted : (remoteTrack?.isMuted || false),
          // 摄像头关闭逻辑
          isCameraOff: isMe ? callStore.callStatus.isCameraOff : (!remoteTrack?.track || member.status !== 'joined'),
          avatar: member.avatar,
          statusHint: statusHint,
          status: member.status
        })
      })

      return list
    })

    const isWaiting = computed(() => callStore.callStatus.phase === 'calling')

    // 动态计算网格行列
    const gridStyle = computed(() => {
      const count = allTracks.value.length
      if (count === 0) return {}

      let cols = 1
      let rows = 1

      if (count <= 1) {
        cols = 1; rows = 1
      } else if (count <= 2) {
        cols = 2; rows = 1
      } else if (count <= 4) {
        cols = 2; rows = 2
      } else {
        cols = 3; rows = Math.ceil(count / 3)
      }

      return {
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`
      }
    })

    const gridClass = computed(() => {
      return `count-${allTracks.value.length}`
    })

    const statusText = computed(() => {
      if (callStore.callStatus.phase === 'calling') return '正在呼叫...'
      return '等待中'
    })

    onMounted(() => {
      // 成员初始化完全交给 Store 的 initMembers 自动处理
    })

    return {
      callStore,
      isWaiting,
      statusText,
      defaultAvatar,
      allTracks,
      gridStyle,
      gridClass,
      CacheType
    }
  }
})
</script>

<style lang="less" scoped>
.active-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #121212;
  color: #fff;
  position: relative;
  overflow: hidden;

  .video-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
    background: #000;

    .video-grid {
      flex: 1;
      display: grid;
      gap: 12px;
      align-items: center;
      justify-content: center;

      .grid-item {
        position: relative;
        width: 100%;
        height: 100%;
        background: #1a1a1a;
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(255, 255, 255, 0.08);
        transition: all 0.3s ease;

        .video-wrapper {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #000;
        }

        .camera-off-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;

          .avatar-box {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            overflow: hidden;
            background: #252525;
            border: 2px solid rgba(255, 255, 255, 0.1);
            transition: all 0.5s ease;

            &.pulse {
              animation: avatar-pulse 2s infinite ease-in-out;
              border-color: #4a90e2;
            }

            .placeholder-avatar {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .status-hint {
            font-size: 14px;
            color: #4a90e2;
            font-weight: 500;
          }
        }

        .user-info-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(8px);
          padding: 4px 12px;
          border-radius: 6px;
          font-size: 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          z-index: 5;
          border: 1px solid rgba(255, 255, 255, 0.1);

          .name {
            max-width: 120px;
            font-weight: 500;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }
  }
}

@keyframes avatar-pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0.4);
  }

  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 25px rgba(74, 144, 226, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(74, 144, 226, 0);
  }
}
</style>
