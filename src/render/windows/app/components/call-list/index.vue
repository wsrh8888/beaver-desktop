<template>
  <div class="call-list-panel" v-if="callListStore.totalCount > 0">
    <!-- 触发按钮 -->
    <div class="trigger-btn" @click="togglePanel" :class="{ 'has-incoming': callListStore.hasIncoming }">
      <svg class="icon" viewBox="0 0 24 24" fill="currentColor">
        <path
          d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" />
      </svg>
      <span class="badge" v-if="callListStore.totalCount > 0">{{ callListStore.totalCount }}</span>
    </div>

    <!-- 展开的列表面板 -->
    <Transition name="slide">
      <div class="panel" v-if="isOpen">
        <div class="panel-header">
          <span>通话</span>
          <span class="close-btn" @click="togglePanel">×</span>
        </div>

        <div class="panel-content">
          <!-- 来电列表 -->
          <div v-if="callListStore.incomingCalls.length > 0" class="section">
            <div class="section-title">来电</div>
            <div v-for="call in callListStore.incomingCalls" :key="call.roomId" class="call-item incoming"
              @click="handleOpenIncoming(call)">
              <img class="avatar" :src="call.callerAvatar || defaultAvatar" alt="">
              <div class="info">
                <div class="name">{{ call.callerName || '未知用户' }}</div>
                <div class="status">正在呼叫...</div>
              </div>
              <div class="actions">
                <span class="action-btn accept" @click.stop="handleQuickAccept(call)" title="接听">✓</span>
                <span class="action-btn reject" @click.stop="handleQuickReject(call)" title="拒绝">✕</span>
              </div>
            </div>
          </div>

          <!-- 进行中的通话 -->
          <div v-if="callListStore.activeCalls.length > 0" class="section">
            <div class="section-title">进行中</div>
            <div v-for="call in callListStore.activeCalls" :key="call.roomId" class="call-item active"
              @click="handleOpenActive(call)">
              <img class="avatar" :src="call.callerAvatar || defaultAvatar" alt="">
              <div class="info">
                <div class="name">{{ call.callerName || '未知用户' }}</div>
                <div class="status">{{ call.status === 'calling' ? '呼叫中...' : '通话中' }}</div>
              </div>
              <span class="enter-btn">进入 →</span>
            </div>
          </div>

          <!-- 空状态 -->
          <div v-if="callListStore.totalCount === 0" class="empty">
            暂无通话
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useCallListStore, type ICallItem } from '../../pinia/call-list'
import { hangupCallApi } from 'renderModule/api/call'

export default defineComponent({
  name: 'CallListPanel',
  setup() {
    const callListStore = useCallListStore()
    const isOpen = ref(false)
    const defaultAvatar = 'https://api.dicebear.com/7.x/avataaars/svg?seed=default'

    const togglePanel = () => {
      isOpen.value = !isOpen.value
    }

    // 打开来电提示窗口
    const handleOpenIncoming = (call: ICallItem) => {
      electron?.window.openWindow('call-incoming', {
        width: 360,
        height: 180,
        params: {
          roomId: call.roomId,
          callType: call.callType,
          callerId: call.callerId,
          conversationId: call.conversationId,
          callMode: 'audio',
          role: 'callee',
          windowType: 'incoming'
        }
      })
      isOpen.value = false
    }

    // 快速接听
    const handleQuickAccept = (call: ICallItem) => {
      // 直接打开完整通话窗口并自动接听
      electron?.window.openWindow('call', {
        width: 1000,
        height: 640,
        params: {
          roomId: call.roomId,
          callType: call.callType,
          callerId: call.callerId,
          conversationId: call.conversationId,
          callMode: 'audio',
          role: 'callee',
          autoAccept: true
        }
      })
      // 从列表移除
      callListStore.removeCall(call.roomId)
      isOpen.value = false
    }

    // 快速拒绝
    const handleQuickReject = async (call: ICallItem) => {
      try {
        await hangupCallApi({ roomId: call.roomId })
      } catch (e) {
        console.error('拒绝来电失败:', e)
      }
      callListStore.removeCall(call.roomId)
    }

    // 打开进行中的通话窗口
    const handleOpenActive = (call: ICallItem) => {
      // 激活/打开对应的通话窗口
      electron?.window.openWindow('call', {
        width: 1000,
        height: 640,
        params: {
          roomId: call.roomId,
          callType: call.callType,
          callerId: call.callerId,
          conversationId: call.conversationId,
          callMode: 'audio',
          role: call.status === 'calling' ? 'caller' : 'callee'
        }
      })
      isOpen.value = false
    }

    return {
      callListStore,
      isOpen,
      defaultAvatar,
      togglePanel,
      handleOpenIncoming,
      handleQuickAccept,
      handleQuickReject,
      handleOpenActive
    }
  }
})
</script>

<style lang="less" scoped>
.call-list-panel {
  position: relative;

  .trigger-btn {
    width: 36px;
    height: 36px;
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    position: relative;
    transition: all 0.2s;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    &.has-incoming {
      background: #00c853;
      animation: pulse 2s infinite;
    }

    .icon {
      width: 20px;
      height: 20px;
      color: #fff;
    }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      min-width: 16px;
      height: 16px;
      padding: 0 4px;
      border-radius: 8px;
      background: #ff5252;
      color: #fff;
      font-size: 10px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  .panel {
    position: absolute;
    top: 44px;
    left: 0;
    width: 280px;
    background: #2a2a3e;
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
    overflow: hidden;
    z-index: 1000;

    .panel-header {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      color: #fff;
      font-weight: 500;

      .close-btn {
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        opacity: 0.6;
        font-size: 18px;

        &:hover {
          opacity: 1;
        }
      }
    }

    .panel-content {
      max-height: 300px;
      overflow-y: auto;

      .section {
        padding: 8px 0;

        .section-title {
          padding: 4px 16px;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.5);
        }
      }

      .call-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 16px;
        cursor: pointer;
        transition: background 0.2s;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
        }

        .info {
          flex: 1;

          .name {
            font-size: 14px;
            color: #fff;
            margin-bottom: 2px;
          }

          .status {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.5);
          }
        }

        .actions {
          display: flex;
          gap: 8px;

          .action-btn {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
            cursor: pointer;
            transition: transform 0.2s;

            &:hover {
              transform: scale(1.1);
            }

            &.accept {
              background: #00c853;
              color: #fff;
            }

            &.reject {
              background: #ff5252;
              color: #fff;
            }
          }
        }

        .enter-btn {
          font-size: 12px;
          color: #667eea;
          padding: 4px 8px;
          border-radius: 4px;
          background: rgba(102, 126, 234, 0.1);
        }

        &.incoming {
          .info .status {
            color: #00c853;
          }
        }
      }

      .empty {
        padding: 24px;
        text-align: center;
        color: rgba(255, 255, 255, 0.5);
        font-size: 14px;
      }
    }
  }
}

.slide-enter-active,
.slide-leave-active {
  transition: all 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes pulse {

  0%,
  100% {
    box-shadow: 0 0 0 0 rgba(0, 200, 83, 0.4);
  }

  50% {
    box-shadow: 0 0 0 8px rgba(0, 200, 83, 0);
  }
}
</style>
