<template>
  <div v-if="topConversations.length > 0" class="top-conversations">
    <div class="top-grid" :class="{ expanded: isExpanded }">
      <!-- 折叠状态：最多显示12个，最后一个可能是展开按钮 -->
      <template v-if="!isExpanded">
        <div
          v-for="(chat, index) in visibleConversations"
          :key="chat.conversationId || 'expand'"
          class="top-item"
          @click="handleItemClick(chat, index === visibleConversations.length - 1 && showExpandBtn)"
        >
          <template v-if="index === visibleConversations.length - 1 && showExpandBtn">
            <div class="top-avatar">
              <img src="renderModule/assets/image/chat/expand.svg" alt="展开">
            </div>
            <div class="top-name">
              展开
            </div>
          </template>
          <template v-else>
            <div class="top-avatar">
              <BeaverImage :file-name="chat.avatar" :cache-type="CacheType.USER_AVATAR" :alt="chat.nickName" />
            </div>
            <div class="top-name">
              {{ chat.nickName }}
            </div>
          </template>
        </div>
      </template>

      <!-- 展开状态：显示所有置顶会话 -->
      <template v-else>
        <div
          v-for="chat in topConversations"
          :key="chat.conversationId"
          class="top-item"
          @click="handleItemClick(chat, false)"
        >
          <div class="top-avatar">
            <BeaverImage :file-name="chat.avatar" :cache-type="CacheType.USER_AVATAR" :alt="chat.nickName" />
          </div>
          <div class="top-name">
            {{ chat.nickName }}
          </div>
        </div>
        <!-- 收起按钮 -->
        <div class="top-item collapse-btn" @click="isExpanded = false">
          <div class="collapse-content">
            <div class="collapse-icon">
              <img src="renderModule/assets/image/chat/collapse.svg" alt="收起">
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useConversationStore } from 'renderModule/windows/app/pinia/conversation/conversation'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { computed, defineComponent, ref } from 'vue'

export default defineComponent({
  components: {
    BeaverImage,
  },
  setup() {
    const conversationStore = useConversationStore()
    const messageViewStore = useMessageViewStore()

    // 展开状态
    const isExpanded = ref(false)

    // 获取所有置顶会话列表
    const topConversations = computed(() => conversationStore.getTopConversations)

    // 计算可见的会话（折叠状态）
    const visibleConversations = computed(() => {
      if (isExpanded.value)
        return topConversations.value

      const maxVisible = 12 // 2行 * 6个
      if (topConversations.value.length <= maxVisible) {
        return topConversations.value
      }

      // 如果超过12个，显示前11个 + 展开按钮
      return [
        ...topConversations.value.slice(0, maxVisible - 1),
        { conversationId: 'expand', nickName: '', avatar: '' } as any, // 占位符
      ]
    })

    // 是否显示展开按钮
    const showExpandBtn = computed(() => {
      return !isExpanded.value && topConversations.value.length > 12
    })

    // 处理点击事件
    const handleItemClick = (chat: any, isExpandBtn: boolean = false) => {
      if (isExpandBtn) {
        isExpanded.value = true
      }
      else if (chat.conversationId !== 'expand') {
        messageViewStore.setCurrentChat(chat.conversationId)
      }
    }

    return {
      isExpanded,
      topConversations,
      visibleConversations,
      showExpandBtn,
      handleItemClick,
      CacheType,
    }
  },
})
</script>

<style lang="less" scoped>
.top-conversations {
  border-bottom: 1px solid #EBEEF5;

  .top-grid {
    display: grid;
    grid-template-columns: repeat(6, 1fr);
    gap: 0px;
    padding: 8px 5px;
    width: 100%;
    box-sizing: border-box;

    .top-item {
      width: 100%;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4px 1px 1px 1px;
      border: 1px solid transparent;
      box-sizing: border-box;
      padding-bottom: 5px;

      &:hover {
        background: #F9FAFB;
      }
      .top-avatar {
        width: 30px;
        height: 30px;
        border-radius: 6px;
        margin-bottom: 2px;
        overflow: hidden;
        flex-shrink: 0;

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
      }

      .top-name {
        font-size: 8px;
        color: #333;
        text-align: center;
        line-height: 9px;
        white-space: nowrap;
        overflow: hidden;
        max-width: 36px;
        width: 36px;
        height: 9px;
        flex-shrink: 0;
      }

      .expand-content {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        height: 100%;
        justify-content: center;

        .expand-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          position: relative;

          img {
            width: 100%;
            height: 100%;
            object-fit: contain;
          }
        }

        .expand-text {
          font-size: 11px;
          color: #666;
          font-weight: 500;
          transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
        }
      }

      &.collapse-btn {
        border-radius: 8px;
        grid-column: 1 / -1;
        padding: 0;
        border: none;
        &:hover {
          background: none;
        }

        .collapse-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          height: 100%;
          justify-content: center;

          .collapse-icon {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;

            img {
              width: 100%;
              height: 100%;
              object-fit: contain;
            }
          }

          .collapse-text {
            font-size: 11px;
            color: #666;
            font-weight: 500;
            transition: all 0.2s cubic-bezier(0.33, 1, 0.68, 1);
          }
        }
      }
    }
  }
}
</style>
