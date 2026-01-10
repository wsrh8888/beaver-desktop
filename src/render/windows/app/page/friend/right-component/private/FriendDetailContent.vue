<template>
  <div class="friend-detail-content">
    <!-- 简洁的好友详情页 -->
    <div class="profile-section">
      <div class="avatar-section">
        <div class="avatar">
          <BeaverImage
            v-if="friendInfo?.avatar"
            :file-name="friendInfo.avatar"
            :alt="friendInfo.nickName"
          />
        </div>
      </div>

      <div class="info-section">
        <h1 class="name">
          {{ friendInfo?.nickName || '未知用户' }}
        </h1>
        <p v-if="friendInfo?.notice" class="remark">
          {{ friendInfo.notice }}
        </p>
      </div>
    </div>

    <!-- 用户信息 -->
    <div class="info-section">
      <div class="info-item">
        <span class="info-label">用户ID：</span>
        <span class="info-value">{{ friendInfo?.userId || '未知' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">来源：</span>
        <span class="info-value">{{ friendInfo?.source || '' }}</span>
      </div>
    </div>

    <!-- 发送消息按钮 -->
    <div class="send-message-section">
      <button class="send-message-btn" @click="handleSendMessage">
        发消息
      </button>
    </div>
  </div>
</template>

<script lang="ts">
// import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useRouterHelper } from 'renderModule/utils/router/index'
import { useFriendStore } from 'renderModule/windows/app/pinia/friend/friend'
import { useFriendViewStore } from 'renderModule/windows/app/pinia/view/friend'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { computed, onMounted } from 'vue'

export default {
  name: 'FriendDetailContent',
  components: {
    BeaverImage,
  },
  setup() {
    const friendViewStore = useFriendViewStore()
    const friendStore = useFriendStore()
    const messageViewStore = useMessageViewStore()
    const routerHelper = useRouterHelper()

    onMounted(() => {
    })

    // 获取好友信息
    const friendInfo = computed(() => {
      const selectedId = friendViewStore.selectedId
      if (!selectedId)
        return null

      // 从好友列表中查找，使用userId
      return friendStore.getFriendList.find(friend =>
        friend.userId === selectedId,
      )
    })
    // 处理发消息
    const handleSendMessage = () => {
      if (friendInfo.value?.userId) {
        // 设置当前聊天会话ID
        console.error('friendInfo.value.conversationId', friendInfo)

        // 跳转到聊天页面
        routerHelper.push('/message')
        setTimeout(() => {
          messageViewStore.setCurrentChat(friendInfo.value.conversationId)
        }, 100)
      }
    }

    return {
      friendInfo,
      handleSendMessage,
    }
  },
}
</script>

<style lang="less" scoped>
.friend-detail-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;
  padding: 24px;
}

.profile-section {
  padding: 32px 24px;
  text-align: center;
}

.avatar-section {
  margin-bottom: 24px;
}

.avatar {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  overflow: hidden;
  margin: 0 auto;
  background: #F9FAFB;
}

.friend-avatar {
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background: #E8E8E8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
  color: #636E72;
}

.info-section {
  margin-bottom: 32px;
}

.name {
  font-size: 16px;
  font-weight: 500;
  color: #2D3436;
  margin: 0 0 8px 0;
  line-height: 1.3;
}

.remark {
  font-size: 13px;
  color: #636E72;
  margin: 0;
  line-height: 1.5;
}

.info-section {
  margin-bottom: 32px;

  .section-title {
    font-size: 14px;
    font-weight: 600;
    color: #2D3436;
    margin-bottom: 16px;
  }
}

.info-item {
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #EBEEF5;

  &:last-child {
    border-bottom: none;
  }
}

.info-label {
  color: #636E72;
  font-size: 14px;
}

.info-value {
  color: #2D3436;
  font-size: 14px;
  font-weight: 500;
}

/* 发送消息按钮 */
.send-message-section {
  display: flex;
  justify-content: center;
  margin-top: 32px;
}

.send-message-btn {
  padding: 10px 32px;
  background: #FF7D45;
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #E86835;
  }
}
</style>
