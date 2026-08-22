<template>
  <div class="message__container">
    <div class="message__left">
      <MessageLeftComponent />
    </div>

    <div v-show="currentChatId" class="message__right">
      <!-- 私聊 / 群聊：消息会话面板 -->
      <template v-if="panelType === 'chat'">
        <ChatHeaderComponent @show-details="handleShowDetails" />
        <ChatContentComponent />
        <ChatMenusComponent />
      </template>

      <!-- 圈子：圈子会话面板 -->
      <template v-else-if="panelType === 'circle'">
        <CircleRight
          ref="circleRightRef"
          :circle-id="currentCircleId"
          @show-details="handleShowDetails('circle')"
          @show-post-detail="handleShowPostDetail"
        />
      </template>

      <!-- 后续其他会话类型在此扩展，例如：v-else-if="panelType === 'xxx'" -->
    </div>

    <!-- 各种详情组件放在外层，因为使用了 fixed 定位 -->
    <GroupDetailsComponent :visible="currentDetailType === 'group'" @close="hideDetails" />
    <PrivateDetailsComponent
      v-if="currentDetailType === 'private'"
      :visible="currentDetailType === 'private'"
      @close="hideDetails"
    />
    <CircleDetailsComponent
      v-if="currentDetailType === 'circle'"
      :visible="currentDetailType === 'circle'"
      :circle-id="currentCircleId"
      @close="hideDetails"
      @quit="handleCircleQuit"
    />
    <CirclePostDetail
      v-if="activePost"
      :post="activePost"
      @close="activePost = null"
      @commented="handlePostChanged"
      @liked="handlePostChanged"
    />

    <MergedForwardViewer />
    <GroupAssistantOverlay />
  </div>
</template>

<script lang="ts">
import type { ICirclePostItem } from 'commonModule/type/ajax/circle'
import { computed, defineComponent, ref, watch } from 'vue'
import CircleDetailsComponent from 'renderModule/windows/circle/page/circle/detail-components/details/index.vue'
import CirclePostDetail from 'renderModule/windows/circle/page/circle/detail-components/postDetail/index.vue'
import CircleRight from 'renderModule/windows/circle/page/circle/right-component/index.vue'
import { parseCircleId } from 'renderModule/windows/circle/store/circle/circle'
import { useConversationStore } from '../../pinia/conversation/conversation'
import { useMessageViewStore } from '../../pinia/view/message'
import GroupAssistantOverlay from './detail-components/groupAssistant/index.vue'
import GroupDetailsComponent from './detail-components/groupDetails/index.vue'
import MergedForwardViewer from './detail-components/MergedForwardViewer.vue'
import PrivateDetailsComponent from './detail-components/PrivateDetails.vue'
import MessageLeftComponent from './left-components/MessageLeft.vue'
import ChatMenusComponent from './right-component/bottom/ChatMenus.vue'
import ChatContentComponent from './right-component/content/content.vue'
import ChatHeaderComponent from './right-component/header/header.vue'

type PanelType = 'chat' | 'circle'
type DetailType = 'private' | 'group' | 'circle' | 'ai'

export default defineComponent({
  name: 'MessageView',
  components: {
    MessageLeftComponent,
    ChatHeaderComponent,
    ChatContentComponent,
    ChatMenusComponent,
    GroupDetailsComponent,
    PrivateDetailsComponent,
    CircleDetailsComponent,
    CirclePostDetail,
    CircleRight,
    MergedForwardViewer,
    GroupAssistantOverlay,
  },
  setup() {
    const currentDetailType = ref<DetailType | null>(null)
    const activePost = ref<ICirclePostItem | null>(null)
    const circleRightRef = ref<{
      loadPosts: () => Promise<void>
      postList: ICirclePostItem[]
    } | null>(null)
    const messageViewStore = useMessageViewStore()
    const conversationStore = useConversationStore()

    const currentChatId = computed(() => messageViewStore.currentChatId)
    const currentCircleId = computed(() => {
      const id = currentChatId.value
      if (!id)
        return ''
      return parseCircleId(id)
    })

    /** 按会话类型决定右侧面板，后续可继续扩展 */
    const panelType = computed<PanelType | null>(() => {
      const id = currentChatId.value
      if (!id)
        return null

      if (id.startsWith('circle_'))
        return 'circle'

      const info = conversationStore.getConversationInfo(id)
      if (info?.chatType === 3)
        return 'circle'

      // chatType 1 私聊 / 2 群聊，统一走聊天面板
      return 'chat'
    })

    const handleShowDetails = (type: DetailType) => {
      currentDetailType.value = type
    }

    const hideDetails = () => {
      currentDetailType.value = null
    }

    const handleShowPostDetail = (post: ICirclePostItem) => {
      activePost.value = post
    }

    const handlePostChanged = async () => {
      await circleRightRef.value?.loadPosts()
      if (activePost.value) {
        const latest = circleRightRef.value?.postList?.find(
          item => item.postId === activePost.value?.postId,
        )
        if (latest)
          activePost.value = latest
      }
    }

    const handleCircleQuit = () => {
      hideDetails()
      activePost.value = null
      if (messageViewStore.currentChatId)
        messageViewStore.setCurrentChat('')
    }

    watch(currentChatId, () => {
      hideDetails()
      activePost.value = null
    })

    return {
      currentChatId,
      currentCircleId,
      panelType,
      currentDetailType,
      activePost,
      circleRightRef,
      handleShowDetails,
      hideDetails,
      handleShowPostDetail,
      handlePostChanged,
      handleCircleQuit,
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
}
</style>
