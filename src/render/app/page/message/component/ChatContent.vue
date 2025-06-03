<template>
  <div class="chat-messages" ref="messageContainer">
    <div v-for="message in messages" :key="message.messageId" class="message" :class="{ 'sent': message.sender.userId === userStore.userInfo.userId }">
      <div class="message-avatar">
        <img :src="message.sender.avatar" :alt="message.sender.nickname">
      </div>
      <div class="message-content" @contextmenu.prevent="showCustomContextMenu($event)">
        <div class="message-text selectable" v-if="message.msg.type === 1" 
             v-html="formatMessageWithEmojis(message.msg.textMsg?.content)" 
             >
        </div>
        <div class="message-image" v-else-if="message.msg.type === 2 && message.msg.imageMsg">
          <img :src="message.msg.imageMsg.url" alt="图片" @click="handleImageClick(message.msg.imageMsg.url)">
        </div>
      </div>
    </div>
    
    <!-- 自定义右键菜单 -->
    <div class="custom-context-menu" v-show="showMenu" :style="menuPosition">
      <div class="menu-item" v-show="copyShow" @click="copySelectedText">复制</div>
      <div class="menu-item" v-show="!copyShow" v-for="item in menuList" :key="item.id">
        <div>{{ item.name }}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted, watch, nextTick, onBeforeUnmount } from 'vue';
import { useChatStore } from 'renderModule/app/pinia/chat/chat';
import { useUserStore } from 'renderModule/app/pinia/user/user';
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation';
import { emojiMap } from 'renderModule/app/utils/emoji';
export default defineComponent({
  setup() {
    const chatStore = useChatStore();
    const userStore = useUserStore();
    const conversationStore = useConversationStore();
    const messageContainer = ref<HTMLElement | null>(null);
    const copyShow = ref(true);
    // 右键菜单相关状态
    const showMenu = ref(false);
    const menuPosition = ref({ top: '0px', left: '0px' });

    const messages = computed(() => {
      const currentId = conversationStore.currentChatId;
      console.error(chatStore.getChatHistory(currentId || ''),'cur11111111111111rentId');
      return currentId ? chatStore.getChatHistory(currentId) : [];
    });

    const menuList = ref([
      { id: 1, name: '复制' },
    ]);
    // 将文本中的表情符号替换为图片
    const formatMessageWithEmojis = (text: string | undefined) => {
      if (!text) return '';
      
      // 使用正则表达式匹配 [xxx] 格式的表情
      return text.replace(/\[[^\]]+\]/g, (match) => {
        const emojiUrl = emojiMap(match);
        if (emojiUrl) {
          return `<img src="${emojiUrl}" alt="${match}" class="message-emoji" draggable="false" />`;
        }
        return match;
      });
    };

    // 显示自定义右键菜单
    const showCustomContextMenu = (event: MouseEvent) => {
      const selection = window.getSelection();
      console.log(selection,'selection');
      if (selection && selection.toString().trim().length > 0) {
        // 只有当有文本被选中时才显示右键菜单
        console.log(selection,'text');
        showMenu.value = true;
        menuPosition.value = {
          top: `${event.clientY}px`,
          left: `${event.clientX}px`
        };
        copyShow.value = true;
        // 阻止默认的右键菜单
        event.preventDefault();
      }else{
        console.log('menu');
        showMenu.value = true;
        menuPosition.value = {
          top: `${event.clientY}px`,
          left: `${event.clientX}px`
        };
        copyShow.value = false;
        event.preventDefault();
      }
    };

    // 复制选中文本
    const copySelectedText = () => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0) {
        try {
          // 尝试使用现代剪贴板API
          navigator.clipboard.writeText(selection.toString())
            .then(() => {
              showMenu.value = false;
            })
            .catch(err => {
              console.error('复制失败:', err);
              // 回退到传统方法
              fallbackCopy(selection.toString());
            });
        } catch (e) {
          // 如果不支持clipboard API，使用传统方法
          fallbackCopy(selection.toString());
        }
      }
      
      showMenu.value = false;
    };

    // 传统复制方法（备用）
    const fallbackCopy = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";  // 避免滚动到底部
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        document.execCommand('copy');
      } catch (err) {
        console.error('复制失败:', err);
      }

      document.body.removeChild(textArea);
    };

    // 点击其他地方时隐藏右键菜单
    const hideMenu = () => {
      showMenu.value = false;
    };

    const scrollToBottom = async () => {
      await nextTick();
      if (messageContainer.value) {
        messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
      }
    };

    const handleImageClick = (src: string) => {
      ElMessage.info('图片预览功能开发中');
    };

    watch(messages, () => {
      scrollToBottom();
    }, { deep: true });

    onMounted(() => {
      scrollToBottom();
      // 添加全局点击事件监听
      document.addEventListener('click', hideMenu);
      document.addEventListener('contextmenu', (e) => {
        // 允许在非自定义区域使用默认右键菜单
        if (!e.target || !(e.target as HTMLElement).closest('.message-text')) {
          showMenu.value = false;
        }
      });
    });

    onBeforeUnmount(() => {
      // 清理事件监听
      document.removeEventListener('click', hideMenu);
    });

    return {
      messages,
      userStore,
      conversationStore,
      messageContainer,
      handleImageClick,
      formatMessageWithEmojis,
      showMenu,
      menuPosition,
      showCustomContextMenu,
      copySelectedText,
      copyShow,
      menuList
    };
  }
});
</script>

<style>
.message-emoji {
  display: inline-block;
  width: 35px;
  height: 35px;
  vertical-align: middle;
  margin: 0 2px;
  user-select: none;
}

.selectable {
  user-select: text !important;
  -webkit-user-select: text !important;
  -moz-user-select: text !important;
  -ms-user-select: text !important;
  cursor: text;
}

.custom-context-menu {
  position: fixed;
  background: white;
  border: 1px solid #EBEEF5;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  padding: 5px 0;
  min-width: 80px;
  z-index: 9999;
}

.menu-item {
  padding: 8px 16px;
  cursor: pointer;
  font-size: 14px;
  color: #2D3436;
}

.menu-item:hover {
  background-color: #F9FAFB;
  color: #FF7D45;
}
</style>

<style lang="less" scoped>
.chat-messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: #F9FAFB;
  display: flex;
  flex-direction: column;

  // 自定义滚动条样式
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

  .message {
    max-width: 70%;
    margin-bottom: 12px;
    display: flex;
    align-items: flex-start;
    animation: fadeIn 0.3s ease-out;

    &.received {
      align-self: flex-start;
    }

    &.sent {
      align-self: flex-end;
      flex-direction: row-reverse;

      .message-content {
        background-color: #FF7D45;
        border-bottom-right-radius: 2px;
        margin-right: 8px;
        margin-left: 0;

        .message-text {
          color: white;
        }
      }
    }

    .message-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      margin: 0 8px;
      background-color: #FFE6D9;
      flex-shrink: 0;
      overflow: hidden;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .message-content {
      padding: 12px;
      border-radius: 12px;
      position: relative;
      background-color: #fff;
      border-bottom-left-radius: 2px;

      .message-text {
        font-size: 13px;
        line-height: 1.5;
        word-break: break-word;
        color: #2D3436;
      }

      .message-image {
        max-width: 240px;
        border-radius: 8px;
        overflow: hidden;

        img {
          width: 100%;
          display: block;
          cursor: pointer;
        }
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
