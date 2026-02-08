<template>
  <div class="message-left">
    <!-- 应用状态显示 -->
    <AppStatusComponent />
    <!-- 来电列表 -->
    <IncomingCallList />

    <div class="search-container">
      <div class="search-wrapper">
        <input v-model="searchText" type="text" class="search-input" placeholder="搜索">
        <!-- <img class="search-icon" src="renderModule/assets/image/chat/search.svg" alt="search"> -->
      </div>
    </div>

    <!-- 置顶会话 -->
    <TopConversationsComponent />

    <div class="chat-list">
      <div v-for="chat in chatList" :key="chat.conversationId" class="chat-item"
        :class="{ active: currentConversationId === chat.conversationId }" @click="handleChatClick(chat)">
        <div class="chat-avatar">
          <BeaverImage :file-name="chat.avatar" :cache-type="CacheType.USER_AVATAR" :alt="chat.nickName" />
        </div>

        <div class="chat-info">
          <div class="chat-header">
            <div class="chat-name">
              {{ chat.nickName }}
            </div>
            <div class="chat-time">
              {{ chat.updatedAtStr }}
            </div>
          </div>
          <div class="chat-preview">
            <span class="preview-text">{{ chat.msgPreview }}</span>
            <div class="chat-indicators">
              <div v-if="chat.unreadCount && !chat.isMuted" class="unread-badge">
                {{ chat.unreadCount }}
              </div>
              <div v-if="chat.isMuted" class="mute-indicator">
                <img src="renderModule/assets/image/chat/mute.svg" alt="muted" />
                <!-- 红色小点 -->
                <div class="red-point" v-if="chat.unreadCount"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import AppStatusComponent from 'renderModule/windows/app/components/business/status/index.vue'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { computed, defineComponent, ref } from 'vue'
import TopConversationsComponent from './TopConversations.vue'
import IncomingCallList from './IncomingCallList.vue'

export default defineComponent({
  components: {
    AppStatusComponent,
    BeaverImage,
    TopConversationsComponent,
    IncomingCallList
  },
  setup() {
    const conversationStore = useConversationStore()
    const messageViewStore = useMessageViewStore()
    const searchText = ref('')

    // 获取非置顶的聊天列表（置顶的在单独组件中显示）
    const chatList = computed(() => conversationStore.getConversations.filter(chat => !chat.isTop))

    // 处理聊天项点击
    const handleChatClick = (chat: any) => {
      messageViewStore.setCurrentChat(chat.conversationId)
    }

    const currentConversationId = computed(() => messageViewStore.currentChatId)

    return {
      searchText,
      chatList,
      currentConversationId,
      handleChatClick,
      CacheType,
    }
  },
})
</script>

<style lang="less" scoped>
.message-left {
  width: 280px;
  height: 100%;
  background: #FFFFFF;
  border-right: 1px solid #EBEEF5;
  display: flex;
  flex-direction: column;

  .search-container {
    padding: 16px 16px 12px;
    border-bottom: 1px solid #EBEEF5;

    .search-wrapper {
      position: relative;

      .search-input {
        width: 100%;
        height: 36px;
        border-radius: 6px;
        border: none;
        background: #F9FAFB;
        padding: 0 16px 0 36px;
        font-size: 13px;
        color: #2D3436;
        transition: all 0.2s;

        &:focus {
          outline: none;
          box-shadow: 0 0 0 1px #FF7D45;
        }

        &::placeholder {
          color: #B2BEC3;
        }
      }

      .search-icon {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        width: 16px;
        height: 16px;
        color: #B2BEC3;
        pointer-events: none;
      }
    }
  }

  .chat-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;

    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.1);
      border-radius: 2px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    .chat-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.2s;

      &:hover {
        background: #F9FAFB;
      }

      &.active {
        background: #FFE6D9;
      }

      .chat-avatar {
        width: 48px;
        height: 48px;
        border-radius: 12px;
        margin-right: 12px;
        position: relative;
        flex-shrink: 0;
        overflow: hidden;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .chat-info {
        flex: 1;
        min-width: 0;

        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;

          .chat-name {
            font-size: 14px;
            font-weight: 500;
            color: #2D3436;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .chat-time {
            font-size: 11px;
            color: #B2BEC3;
            flex-shrink: 0;
            margin-left: 8px;
          }
        }

        .chat-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;

          .preview-text {
            font-size: 12px;
            color: #B2BEC3;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          }

          .chat-indicators {
            display: flex;
            align-items: center;
            gap: 4px;
            margin-left: 8px;
            flex-shrink: 0;

            .unread-badge {
              min-width: 18px;
              height: 18px;
              border-radius: 9px;
              background: #FF5252;
              color: white;
              font-size: 11px;
              display: flex;
              align-items: center;
              justify-content: center;
              padding: 0 5px;
            }

            .mute-indicator {
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;

              img {
                width: 14px;
                height: 14px;
              }

              .red-point {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                margin-left: 4px;
                background: #FF5252;
                border: 1px solid white;
              }
            }
          }
        }
      }
    }
  }
}
</style>
