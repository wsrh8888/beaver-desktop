<template>
  <div class="group-detail-content">
    <!-- 简洁的群聊详情页 -->

    <!-- 群基本信息 -->
    <div class="profile-section">
      <div class="avatar-section">
        <div class="avatar">
          <BeaverImage
            v-if="groupInfo?.fileName"
            :file-name="groupInfo.fileName"
            :alt="groupInfo.name"
          />
          <div v-else class="avatar-placeholder">
            {{ getGroupAvatarText(groupInfo?.name || '') }}
          </div>
        </div>
      </div>

      <div class="info-section">
        <h1 class="name">
          {{ groupInfo?.name || '未命名群聊' }}
        </h1>
        <p v-if="groupInfo?.description" class="remark">
          {{ groupInfo.description }}
        </p>
      </div>
    </div>

    <!-- 群信息 -->
    <div class="info-section">
      <div class="info-item">
        <span class="info-label">群号：</span>
        <span class="info-value">{{ groupInfo?.conversationId || '未知' }}</span>
      </div>
      <div class="info-item">
        <span class="info-label">成员数：</span>
        <span class="info-value">{{ groupInfo?.memberCount || 0 }}人</span>
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
import { useGroupStore } from 'renderModule/app/pinia/group/group'
import { useFriendViewStore } from 'renderModule/app/pinia/view/friend'
import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useRouterHelper } from 'renderModule/utils/router/index'
import { computed } from 'vue'

export default {
  name: 'GroupDetailContent',
  components: {
    BeaverImage,
  },
  setup() {
    const friendViewStore = useFriendViewStore()
    const groupStore = useGroupStore()
    const messageViewStore = useMessageViewStore()
    const routerHelper = useRouterHelper()

    // 获取群聊信息
    const groupInfo = computed(() => {
      const selectedId = friendViewStore.selectedId
      if (!selectedId)
        return null

      return groupStore.getGroupById(selectedId)
    })

    // 获取群头像文本
    const getGroupAvatarText = (name: string) => {
      if (!name)
        return '群'
      return name.length > 1 ? name.substring(0, 2) : name
    }

    // 处理发消息
    const handleSendMessage = () => {
      if (groupInfo.value?.conversationId) {
        // 设置当前聊天会话ID
        messageViewStore.setCurrentChat(groupInfo.value.conversationId)
        // 跳转到聊天页面
        routerHelper.push('/message')
      }
    }

    return {
      groupInfo,
      getGroupAvatarText,
      handleSendMessage,
    }
  },
}
</script>

<style lang="less" scoped>
.group-detail-content {
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
