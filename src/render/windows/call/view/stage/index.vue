<template>
  <div class="main-video-view">
    <!-- 统一视频网格 (始终显示，包含本地和远程) -->
    <div class="video-container">
      <div v-if="allTracks.length > 0" class="video-grid" :class="`count-${allTracks.length}`" :style="gridStyle">
        <div v-for="item in allTracks" :key="item.sid" class="grid-item">
          <!-- 视频画面 -->
          <div v-if="!item.isCameraOff && item.track" class="video-wrapper">
            <VideoRenderer :track="item.track" :is-local="item.isLocal" />
          </div>

          <!-- 占位图 (摄像头关闭或呼叫等待中) -->
          <div v-else class="camera-off-placeholder">
            <div class="avatar-box" :class="{ 'pulse': item.status === 'calling' }">
              <BeaverImage :file-name="item.avatar" image-class="placeholder-avatar"
                :cache-type="CacheType.USER_AVATAR" />
            </div>
            <div v-if="item.statusHint" class="status-hint">{{ item.statusHint }}</div>
            <div class="user-name">{{ item.identity }}</div>
          </div>

          <!-- 用户标签 (仅视频开启时显示) -->
          <div v-if="!item.isCameraOff && item.track" class="user-info-tag">
            <span class="name">{{ item.identity }}</span>
            <span v-if="item.isMuted" class="status-icon">🔇</span>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import { CacheType } from 'commonModule/type/cache/cache'
import { usecallStore } from '../../pinia/call'
import { useUserStore } from '../../pinia/user'
import { getMemberStatusHint } from '../../type/notification'
import VideoRenderer from '../../components/VideoRenderer.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

export default defineComponent({
  name: 'CallViewStage',
  components: {
    VideoRenderer,
    BeaverImage
  },
  setup() {
    const callStore = usecallStore()
    const userStore = useUserStore()

    const allTracks = computed(() => {
      const list: any[] = []
      const visibleMembers = callStore.members.filter(
        m => m.status === 'calling' || m.status === 'joined'
      )

      visibleMembers.forEach(member => {
        const userId = member.userId
        const isMe = userId === userStore.getUserId

        list.push({
          sid: member.sid || `slot-${userId}`,
          userId,
          identity: member.nickName || userId,
          track: member.track || null,
          isLocal: isMe,
          isMuted: member.isMuted ?? false,
          isCameraOff: member.isCameraOff ?? (!member.track || member.status !== 'joined'),
          avatar: member.avatar,
          statusHint: getMemberStatusHint(member.status),
          status: member.status
        })
      })

      return list
    })

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

    return {
      allTracks,
      gridStyle,
      CacheType
    }
  }
})
</script>

<style lang="less" scoped>
.main-video-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #f5f7fa;
  position: relative;
  overflow: hidden;

  .video-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 12px;
    position: relative;

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
        background: #fff;
        border-radius: 8px;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        border: 1px solid #ebedf0;

        .video-wrapper {
          width: 100%;
          height: 100%;
          background: #000;
        }

        .camera-off-placeholder {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;

          .avatar-box {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            background: #f0f2f5;
            border: 1px solid #ebedf0;

            &.pulse {
              animation: avatar-pulse 2s infinite ease-in-out;
            }

            .placeholder-avatar {
              width: 100%;
              height: 100%;
              object-fit: cover;
            }
          }

          .status-hint {
            font-size: 12px;
            color: #ff7d45;
          }

          .user-name {
            font-size: 14px;
            color: #333;
            font-weight: 500;
          }
        }

        .user-info-tag {
          position: absolute;
          bottom: 12px;
          left: 12px;
          background: rgba(0, 0, 0, 0.5);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          color: #fff;
          display: flex;
          align-items: center;
          gap: 4px;
          z-index: 5;

          .name {
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
        }
      }
    }

    .empty-state {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #909399;
    }

    .speaking-indicator {
      position: absolute;
      top: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: #eef3ff;
      color: #4a6fa1;
      padding: 6px 16px;
      border-radius: 4px;
      font-size: 14px;
      z-index: 10;
      border: 1px solid #d9e6ff;
    }
  }
}

@keyframes avatar-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(255, 125, 69, 0.2);
  }

  70% {
    box-shadow: 0 0 0 15px rgba(255, 125, 69, 0);
  }

  100% {
    box-shadow: 0 0 0 0 rgba(255, 125, 69, 0);
  }
}
</style>
