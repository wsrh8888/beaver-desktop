<template>
  <div class="message-left">
    <div class="search-container">
      <div class="search-wrapper">
        <input v-model="searchText" type="text" class="search-input" placeholder="搜索" @input="handleSearch">
        <SelectGroup />
        <!-- <img class="search-icon" src="renderModule/assets/image/chat/search.svg" alt="search"> -->
      </div>
    </div>

    <div class="chat-list">
      <div
        v-for="chat in chatList"
        :key="chat.conversationId"
        class="chat-item"
        :class="{ active: currentConversationId === chat.conversationId }"
        @click="handleChatClick(chat)"
      >
        <div class="chat-avatar">
          <BeaverImage
            :file-name="chat.fileName"
            :cache-type="CacheType.AVATAR"
            :alt="chat.nickname"
          />
        </div>

        <div class="chat-info">
          <div class="chat-header">
            <div class="chat-name">
              {{ chat.nickname }}
            </div>
            <div class="chat-time">
              {{ chat.create_at }}
            </div>
          </div>
          <div class="chat-preview">
            <span class="preview-text">{{ chat.msg_preview }}</span>
            <div v-if="chat.unread_count" class="unread-badge">
              {{ chat.unread_count }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import selectGroup from 'renderModule/app/components/selectGroup/selectGroup.vue'
import { useChatStore } from 'renderModule/app/pinia/chat/chat'
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  components: {
    SelectGroup: selectGroup,
    BeaverImage,
  },
  setup() {
    const conversationStore = useConversationStore()
    const chatStore = useChatStore()
    const messageViewStore = useMessageViewStore()
    const searchText = ref('')

    // 获取排序后的聊天列表
    const chatList = computed(() => conversationStore.getRecentChatList())

    // 获取当前会话ID
    const currentConversationId = computed(() => messageViewStore.currentChatId)

    // 处理搜索
    const handleSearch = () => {
      // 实现搜索逻辑
    }

    // 处理聊天项点击
    const handleChatClick = (chat: any) => {
      messageViewStore.setCurrentChat(chat.conversationId)
      chatStore.loadChatHistory(chat.conversationId, true)
      // conversationStore.setCurrentConversationId(chat.conversationId);
    }

    // 判断是否在线
    const isOnline = (_chat: any) => {
      // 这里可以根据实际需求实现在线状态判断
      return true
    }
    return {
      searchText,
      chatList,
      currentConversationId,
      handleSearch,
      handleChatClick,
      isOnline,
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
            margin-left: 8px;
            flex-shrink: 0;
          }
        }
      }
    }
  }
}
</style>
