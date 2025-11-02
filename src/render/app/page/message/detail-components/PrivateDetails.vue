<template>
  <div>
    <div class="private-details-sidebar" :class="{ active: isVisible }">
      <div class="sidebar-header">
        <h3>私聊详情</h3>
        <button class="close-sidebar" @click="closeDetails">
          <img src="renderModule/assets/image/private/close.svg" alt="关闭">
        </button>
      </div>
      <div class="sidebar-content">
        <!-- 用户基本信息 -->
        <div class="user-info">
          <div class="user-avatar-container">
            <div v-if="userInfo" class="user-avatar">
              <BeaverImage
                v-if="userInfo.fileName"
                :file-name="userInfo.fileName"
                alt="用户头像"
                image-class="user-avatar-image"
              />
            </div>
          </div>
          <div class="user-name-container">
            <div class="user-name">
              {{ userInfo?.nickname || '用户' }}
            </div>
            <div v-if="userInfo" class="user-id">
              用户ID: {{ userInfo.userId }}
            </div>
          </div>
        </div>

        <!-- 用户详细信息 -->
        <div class="user-details">
          <div class="detail-item">
            <div class="detail-label">
              昵称
            </div>
            <div class="detail-value">
              {{ userInfo?.nickname || '未设置' }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              用户ID
            </div>
            <div class="detail-value">
              {{ userInfo?.userId || '未知' }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              备注
            </div>
            <div class="detail-value">
              {{ userInfo?.notice || '无备注' }}
            </div>
          </div>

          <div class="detail-item">
            <div class="detail-label">
              来源
            </div>
            <div class="detail-value">
              {{ userInfo?.source || '未知' }}
            </div>
          </div>
        </div>

        <!-- 聊天设置 -->
        <div class="chat-settings">
          <div class="settings-header">
            聊天设置
          </div>

          <div class="settings-item">
            <div class="setting-label">
              消息免打扰
            </div>
            <label class="switch">
              <input v-model="settings.mute" type="checkbox">
              <span class="slider" />
            </label>
          </div>

          <div class="settings-item">
            <div class="setting-label">
              置顶聊天
            </div>
            <label class="switch">
              <input v-model="settings.top" type="checkbox">
              <span class="slider" />
            </label>
          </div>

          <!-- 移除了收藏夹设置，因为实际项目中可能不需要 -->
        </div>

        <button class="delete-chat" @click="handleDeleteChat">
          删除聊天
        </button>
      </div>
    </div>

    <!-- 覆盖层 -->
    <div class="overlay" :class="{ active: isVisible }" @click="closeDetails" />
  </div>
</template>

<script lang="ts">
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useFriendStore } from 'renderModule/app/pinia/friend/friend'
// import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent, ref, watch } from 'vue'

export default defineComponent({
  name: 'PrivateDetails',
  components: {
    BeaverImage,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'close'],
  setup(props, { emit }) {
    const _conversationStore = useConversationStore()
    const friendStore = useFriendStore()
    const messageViewStore = useMessageViewStore()

    const isVisible = ref(props.visible)

    // 聊天设置 - 只保留实际有用的
    const settings = ref({
      mute: false,
      top: false,
    })

    // 监听visible属性变化
    watch(() => props.visible, (newVal) => {
      isVisible.value = newVal
    })

    // 获取当前聊天用户信息
    const userInfo = computed(() => {
      const currentId = messageViewStore.currentChatId
      if (!currentId)
        return null

      // 从好友store获取用户信息
      return friendStore.getFriendByConversationId(currentId)
    })

    // 移除了获取头像文本函数，因为不再需要

    // 移除了格式化时间函数，因为不再需要

    // 关闭详情面板
    const closeDetails = () => {
      isVisible.value = false
      emit('update:visible', false)
      emit('close')
    }

    // 处理删除聊天
    const handleDeleteChat = () => {
      // 使用更用户友好的确认方式
      // eslint-disable-next-line no-alert
      const confirmed = confirm('确定要删除与该用户的聊天记录吗？')
      if (confirmed) {
        console.log('删除聊天功能开发中')
        closeDetails()
      }
    }

    return {
      isVisible,
      userInfo,
      settings,
      closeDetails,
      handleDeleteChat,
    }
  },
})
</script>

<style lang="less" scoped>
/* 私聊详情侧边栏 */
.private-details-sidebar {
  position: fixed;
  top: 0;
  right: -360px;
  width: 360px;
  height: 100%;
  background-color: #FFFFFF;
  border-left: 1px solid #EBEEF5;
  z-index: 100;
  transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);

  &.active {
    right: 0;
  }

  .sidebar-header {
    height: 64px;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;

    h3 {
      font-size: 16px;
      font-weight: 500;
      color: #2D3436;
    }

    .close-sidebar {
      width: 32px;
      height: 32px;
      border-radius: 6px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: transparent;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
      }

      img {
        width: 20px;
        height: 20px;
        fill: #636E72;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 24px 16px;

    /* 自定义滚动条样式 */
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(178, 190, 195, 0.5);
      border-radius: 3px;

      &:hover {
        background-color: rgba(178, 190, 195, 0.8);
      }
    }
  }
}

/* 用户基本信息 */
.user-info {
  display: flex;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #EBEEF5;

  .user-avatar-container {
    position: relative;
    margin-right: 20px;

    .user-avatar {
      width: 72px;
      height: 72px;
      border-radius: 12px;
      background-color: #FFE6D9;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #FF7D45;
      font-size: 28px;
      font-weight: 600;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      position: relative;
      overflow: hidden;

      .user-avatar-image {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }
  }

  .user-name-container {
    flex: 1;

    .user-name {
      font-size: 20px;
      font-weight: 600;
      color: #2D3436;
      margin-bottom: 8px;
    }

    .user-id {
      font-size: 13px;
      color: #B2BEC3;
    }
  }
}

/* 用户详细信息 */
.user-details {
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #EBEEF5;

  .detail-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 0;
    border-bottom: 1px solid #EBEEF5;

    &:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: 14px;
      color: #636E72;
      flex: 1;
    }

    .detail-value {
      font-size: 14px;
      color: #2D3436;
      text-align: right;
      max-width: 200px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

/* 聊天设置 */
.chat-settings {
  margin-bottom: 32px;

  .settings-header {
    font-size: 15px;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 16px;
  }

  .settings-item {
    padding: 16px 0;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    align-items: center;
    justify-content: space-between;

    &:last-child {
      border-bottom: none;
    }

    .setting-label {
      font-size: 14px;
      color: #636E72;
      flex: 1;
    }

    .switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 22px;

      input {
        opacity: 0;
        width: 0;
        height: 0;
      }

      .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #EBEEF5;
        transition: .3s;
        border-radius: 22px;

        &:before {
          position: absolute;
          content: "";
          height: 18px;
          width: 18px;
          left: 2px;
          bottom: 2px;
          background-color: white;
          transition: .3s;
          border-radius: 50%;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
        }
      }

      input:checked + .slider {
        background-color: #FF7D45;
      }

      input:focus + .slider {
        box-shadow: 0 0 1px #FF7D45;
      }

      input:checked + .slider:before {
        transform: translateX(22px);
      }
    }
  }
}

/* 删除聊天按钮 */
.delete-chat {
  width: 100%;
  height: 44px;
  border-radius: 8px;
  background-color: #FFE6D9;
  color: #E86835;
  border: 1px solid #E86835;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 24px;
  transition: all 0.2s;

  &:hover {
    background-color: #E86835;
    color: #FFFFFF;
  }
}

/* 覆盖层 */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 90;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;

  &.active {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
