<template>
  <div class="message__container">
    <div class="message__left">
      <MessageLeftComponent />
    </div>
    <div v-show="currentChatId" class="message__right">
      <ChatHeaderComponent
        @show-details="handleShowDetails"
      />
      <ChatContentComponent />
      <ChatMenusComponent />
    </div>

    <!-- 各种详情组件放在外层，因为使用了fixed定位 -->
    <!-- 群聊详情 -->
    <GroupDetailsComponent
      :visible="currentDetailType === 'group'"
      @close="hideDetails"
    />

    <!-- 私聊详情 -->
    <PrivateDetailsComponent
      v-if="currentDetailType === 'private'"
      :visible="currentDetailType === 'private'"
      @close="hideDetails"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue'
import { useMessageViewStore } from '../../pinia/view/message'
import GroupDetailsComponent from './detail-components/GroupDetails.vue'
import PrivateDetailsComponent from './detail-components/PrivateDetails.vue'
import MessageLeftComponent from './left-components/MessageLeft.vue'
import ChatMenusComponent from './right-component/bottom/ChatMenus.vue'
import ChatContentComponent from './right-component/content/content.vue'

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
    // 当前显示的详情类型
    type DetailType = 'private' | 'group' | 'ai'
    const currentDetailType = ref<DetailType | null>(null)
    const messageViewStore = useMessageViewStore()

    // 统一处理显示详情
    const handleShowDetails = (type: DetailType) => {
      currentDetailType.value = type
    }

    const currentChatId = computed(() => {
      return messageViewStore.currentChatId
    })

    // 隐藏详情
    const hideDetails = () => {
      currentDetailType.value = null
    }

    return {
      currentChatId,
      currentDetailType,
      handleShowDetails,
      hideDetails,
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
