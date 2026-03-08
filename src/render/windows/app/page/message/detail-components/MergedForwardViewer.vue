<template>
  <div class="merged-forward-sidebar" :class="{ active: forwardViewStore.visible }">
    <div class="sidebar-header">
      <div class="header-left">
        <h3>{{ details?.title || '聊天记录' }}</h3>
        <span class="mfv-count" v-if="details">{{ details.list.length }} 条消息</span>
      </div>
      <button class="close-btn" @click="forwardViewStore.close()">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
    </div>

    <div class="sidebar-content">
      <div v-if="details" class="mfv-chat-list">
        <div v-for="(message, i) in details.list" :key="i" class="message" :class="{
          send: message.sender.userId === userStore.getUserId,
        }">
          <div class="message-avatar">
            <BeaverImage :cache-type="CacheType.USER_AVATAR" :file-name="message.sender.avatar || ''"
              :alt="message.sender.nickName" image-class="avatar-image" />
          </div>
          <div class="message-wrapper">
            <div class="sender-name" v-if="message.sender.userId !== userStore.getUserId">
              {{ message.sender.nickName }}
            </div>
            <div class="message-content">
              <TextMessage v-if="message.msg?.type === 1" :msg="message.msg" />
              <ImageMessage v-else-if="message.msg?.type === 2 && message.msg?.imageMsg" :msg="message.msg" />
              <VideoMessage v-else-if="message.msg?.type === 3 && message.msg?.videoMsg" :msg="message.msg" />
              <AudioFileMessage v-else-if="message.msg?.type === 8" :msg="message.msg" />
              <EmojiMessage v-else-if="message.msg?.type === 6 && message.msg?.emojiMsg" :msg="message.msg" />
              <CallMessage v-else-if="message.msg?.type === 9" :msg="message.msg" />
              <ReplyMessage v-else-if="message.msg?.type === 11" :msg="message.msg" :sender="message.sender" />
              <MergedForwardMessage v-else-if="message.msg?.type === 12 && message.msg?.forwardMsg"
                :msg="message.msg" />
            </div>
          </div>
        </div>
      </div>
      <div v-else class="mfv-empty">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" stroke="currentColor"
            stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
        <p>暂无消息记录</p>
      </div>
    </div>
  </div>
  <!-- 蒙层 -->
  <div class="overlay" :class="{ active: forwardViewStore.visible }" @click="forwardViewStore.close()" />
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useUserStore } from 'renderModule/windows/app/pinia/user/user'
import { useForwardViewStore } from 'renderModule/windows/app/pinia/view/message/forward'
import { computed, defineComponent } from 'vue'

import AudioFileMessage from '../right-component/content/message/audio.vue'
import CallMessage from '../right-component/content/message/call.vue'
import EmojiMessage from '../right-component/content/message/emoji.vue'
import ImageMessage from '../right-component/content/message/image.vue'
import MergedForwardMessage from '../right-component/content/message/merged-forward.vue'
import ReplyMessage from '../right-component/content/message/reply.vue'
import TextMessage from '../right-component/content/message/text.vue'
import VideoMessage from '../right-component/content/message/video.vue'

export default defineComponent({
  name: 'MergedForwardViewer',
  components: {
    BeaverImage,
    AudioFileMessage,
    CallMessage,
    EmojiMessage,
    ImageMessage,
    MergedForwardMessage,
    ReplyMessage,
    TextMessage,
    VideoMessage
  },
  setup() {
    const userStore = useUserStore()
    const forwardViewStore = useForwardViewStore()

    const details = computed(() => {
      return forwardViewStore.forwardData.get(forwardViewStore.activeId)
    })

    return {
      forwardViewStore,
      details,
      userStore,
      CacheType,
    }
  },
})
</script>

<style lang="less" scoped>
.merged-forward-sidebar {
  position: fixed;
  top: 0;
  right: -450px;
  width: 450px;
  height: 100%;
  background-color: #F9FAFB;
  border-left: 1px solid #EBEEF5;
  z-index: 1000;
  transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);
  display: flex;
  flex-direction: column;
  box-shadow: -4px 0 20px rgba(0, 0, 0, 0.1);

  &.active {
    right: 0;
  }

  .sidebar-header {
    height: 64px;
    background: #fff;
    border-bottom: 1px solid #EBEEF5;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    flex-shrink: 0;

    .header-left {
      display: flex;
      align-items: baseline;
      gap: 10px;
      min-width: 0;

      h3 {
        font-size: 15px;
        font-weight: 600;
        color: #2D3436;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: 0;
      }

      .mfv-count {
        font-size: 12px;
        color: #B2BEC3;
        white-space: nowrap;
      }
    }

    .close-btn {
      width: 32px;
      height: 32px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      border: none;
      cursor: pointer;
      color: #B2BEC3;
      transition: background-color 0.2s, color 0.2s;
      flex-shrink: 0;

      &:hover {
        background-color: rgba(0, 0, 0, 0.05);
        color: #636E72;
      }

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  .sidebar-content {
    flex: 1;
    overflow-y: auto;
    padding: 20px 16px;

    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: rgba(178, 190, 195, 0.5);
      border-radius: 3px;
    }
  }
}

.mfv-chat-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message {
  display: flex;
  gap: 10px;
  max-width: 90%;
  animation: fadeIn 0.2s ease-out;

  &.send {
    align-self: flex-end;
    flex-direction: row-reverse;

    .message-wrapper {
      align-items: flex-end;

      .message-content {
        background-color: #FF7D45;
        color: #fff;
        border-bottom-right-radius: 2px;
        border-top-right-radius: 12px;
        border-bottom-left-radius: 12px;
        border-top-left-radius: 12px;
      }
    }
  }

  .message-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    overflow: hidden;
    flex-shrink: 0;
    background: #FFE6D9;

    .avatar-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .message-wrapper {
    display: flex;
    flex-direction: column;
    gap: 4px;
    min-width: 0;

    .sender-name {
      font-size: 11px;
      color: #B2BEC3;
      padding-left: 2px;
    }

    .message-content {
      padding: 8px 12px;
      background-color: #FF7D45;
      border-radius: 12px;
      border-bottom-left-radius: 2px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
      max-width: 100%;
      word-break: break-all;

      :deep(.message-text) {
        padding: 0;
        font-size: 14px;
      }

      :deep(.text-message-wrapper) {
        padding: 0;
      }
    }
  }
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 900;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.3s;

  &.active {
    opacity: 1;
    pointer-events: auto;
  }
}

.mfv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: #B2BEC3;
  padding: 60px 0;

  svg {
    width: 40px;
    height: 40px;
    opacity: 0.5;
  }

  p {
    font-size: 13px;
    margin: 0;
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
