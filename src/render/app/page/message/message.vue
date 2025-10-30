<template>
  <div class="message__container">
    <div class="message__left">
      <MessageLeftComponent />
    </div>
    <div class="message__right">
      <ChatHeaderComponent
        @show-group-details="showGroupDetails"
        @show-private-details="showPrivateDetails"
        @show-ai-details="showAiDetails"
      />
      <ChatContentComponent />
      <div class="resize-handle" @mousedown="startResize" />
      <ChatMenusComponent ref="chatMenus" />
    </div>

    <!-- 各种详情组件放在外层，因为使用了fixed定位 -->
    <!-- 群聊详情 -->
    <GroupDetailsComponent
      :visible="groupDetailsVisible"
      @update:visible="groupDetailsVisible = $event"
      @close="hideGroupDetails"
    />

    <!-- 私聊详情 -->
    <PrivateDetailsComponent
      v-if="privateDetailsComponent"
      :visible="privateDetailsVisible"
      @update:visible="privateDetailsVisible = $event"
      @close="hidePrivateDetails"
    />

    <!-- AI聊天详情 -->
    <!-- <AiDetailsComponent
      v-if="aiDetailsComponent"
      :visible="aiDetailsVisible"
      @update:visible="aiDetailsVisible = $event"
      @close="hideAiDetails"
    ></AiDetailsComponent> -->
  </div>
</template>

<script lang="ts">
import { useChatStore } from 'renderModule/app/pinia/chat/chat'
import { useConversationStore } from 'renderModule/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/app/pinia/view/message'
import { defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import GroupDetailsComponent from './detail-components/GroupDetails.vue'
import PrivateDetailsComponent from './detail-components/PrivateDetails.vue'
import MessageLeftComponent from './left-components/MessageLeft.vue'
import ChatMenusComponent from './right-component/bottom/ChatMenus.vue'
import ChatContentComponent from './right-component/content/ChatContent.vue'
import ChatHeaderComponent from './right-component/header/header.vue'

export default defineComponent({
  name: 'MessageView',
  components: {
    MessageLeftComponent,
    ChatHeaderComponent,
    ChatContentComponent,
    ChatMenusComponent,
    GroupDetailsComponent,
    PrivateDetailsComponent,
  },
  setup() {
    const chatMenus = ref<InstanceType<typeof ChatMenusComponent> | null>(null)
    const conversationStore = useConversationStore()
    const chatStore = useChatStore()
    const messageViewStore = useMessageViewStore()

    // 各种详情面板的可见状态
    const groupDetailsVisible = ref(false)
    const privateDetailsVisible = ref(false)
    const aiDetailsVisible = ref(false)

    // 异步组件加载状态
    const privateDetailsComponent = ref(false)
    const aiDetailsComponent = ref(false)

    let startY = 0
    let startHeight = 0
    let isResizing = false

    // 点击外部区域关闭表情弹窗
    const handleClickOutside = (event: MouseEvent) => {
      if (chatMenus.value) {
        chatMenus.value.closeEmojiPopup(event)
      }
    }

    const startResize = (e: MouseEvent) => {
      isResizing = true
      startY = e.clientY
      if (chatMenus.value) {
        startHeight = chatMenus.value.$el.offsetHeight
        // 开始拖动时隐藏表情包详情
        chatMenus.value.hideEmojiPopup()
      }

      document.addEventListener('mousemove', resize)
      document.addEventListener('mouseup', stopResize)
    }

    const resize = (e: MouseEvent) => {
      if (!isResizing)
        return

      requestAnimationFrame(() => {
        if (chatMenus.value) {
          const deltaY = startY - e.clientY
          const newHeight = Math.max(150, Math.min(300, startHeight + deltaY))
          chatMenus.value.setHeight(newHeight)
        }
      })
    }

    const stopResize = () => {
      isResizing = false
      document.removeEventListener('mousemove', resize)
      document.removeEventListener('mouseup', stopResize)
    }

    // 显示群组详情
    const showGroupDetails = () => {
      // 隐藏其他详情面板
      hidePrivateDetails()
      hideAiDetails()

      // 显示群组详情
      groupDetailsVisible.value = true
    }

    // 隐藏群组详情
    const hideGroupDetails = () => {
      groupDetailsVisible.value = false
    }

    // 显示私聊详情
    const showPrivateDetails = () => {
      // 隐藏其他详情面板
      hideGroupDetails()
      hideAiDetails()

      // 加载私聊详情组件
      privateDetailsComponent.value = true

      // 显示私聊详情
      privateDetailsVisible.value = true
    }

    // 隐藏私聊详情
    const hidePrivateDetails = () => {
      privateDetailsVisible.value = false
    }

    // 显示AI聊天详情
    const showAiDetails = () => {
      // 隐藏其他详情面板
      hideGroupDetails()
      hidePrivateDetails()

      // 加载AI聊天详情组件
      aiDetailsComponent.value = true

      // 显示AI聊天详情
      aiDetailsVisible.value = true
    }

    // 隐藏AI聊天详情
    const hideAiDetails = () => {
      aiDetailsVisible.value = false
    }

    // 在mounted钩子中添加事件监听
    onMounted(() => {
      // 添加全局点击事件监听
      document.addEventListener('click', handleClickOutside)

      // 确保有默认选中的聊天
      nextTick(() => {
        const chatList = conversationStore.getRecentChatList()
        if (!messageViewStore.currentChatId && chatList.length > 0) {
          console.log('页面加载时自动选择第一个聊天')
          messageViewStore.setCurrentChat(chatList[0].conversationId)
          // 同时加载聊天记录
          chatStore.loadChatHistory(chatList[0].conversationId, true)
        }
      })
    })

    // 在beforeUnmount钩子中移除事件监听
    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      chatMenus,
      groupDetailsVisible,
      privateDetailsVisible,
      aiDetailsVisible,
      privateDetailsComponent,
      aiDetailsComponent,
      startResize,
      showGroupDetails,
      hideGroupDetails,
      showPrivateDetails,
      hidePrivateDetails,
      showAiDetails,
      hideAiDetails,
    }
  },
})
</script>

<style lang="less" scoped>
.message__container {
  display: flex;
  height: 100%;
  overflow-y: hidden;

  .message__left {
    height: 100%;
    overflow-y: auto;
  }

  .message__right {
    flex: 1;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .resize-handle {
    height: 2px;
    background-color: #EBEEF5;
    cursor: ns-resize;
    transition: background-color 0.2s;
    will-change: background-color;
    user-select: none;
  }
}
</style>
