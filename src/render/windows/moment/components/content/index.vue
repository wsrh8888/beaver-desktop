<template>
  <!-- 主要内容区域 -->
  <div class="moment__main">
    <!-- 动态列表 -->
    <div class="moments-section" ref="listContent" @scroll="handleScroll">
      <!-- 动态项列表 -->
      <div class="moments-list">
        <MomentItem
          v-for="moment in momentList"
          :key="moment.id"
          :moment="moment"
          @moment-click="handleMomentClick"
          @comment="handleComment"
        />
      </div>
    </div>
  </div>

</template>

<script lang="ts">
import { defineComponent, ref, onMounted, computed } from 'vue'
import MomentItem from './momentItem.vue'
import { useMomentStore } from '../../store/moment/moment'

export default defineComponent({
  name: 'MomentContent',
  components: {
    MomentItem,
  },
  setup() {
    const listContent = ref<HTMLDivElement>()
    const momentStore = useMomentStore()

    // 监听滚动事件
    const handleScroll = async () => {
      if (!listContent.value) return

      const { scrollTop, scrollHeight, clientHeight } = listContent.value
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100

      if (isNearBottom && momentStore.hasMore && !momentStore.loading) {
        await momentStore.loadMoreMoments()
      }
    }

    // 处理动态点击
    const handleMomentClick = (moment: any) => {
      momentStore.showMomentDetail(moment.id)
    }

    // 处理评论点击
    const handleComment = (momentId: string) => {
      momentStore.showMomentDetail(momentId)
    }

    // 处理发送评论
    const handleSendComment = (momentId: string, commentData: any) => {
      console.log('发送评论:', momentId, commentData)
      // TODO: 调用API发送评论
    }

    onMounted(async () => {
      await momentStore.loadMoments()
    })

    const momentList = computed(() => {
      return momentStore.momentList
    })

    return {
      listContent,
      momentList,
      handleScroll,
      handleMomentClick,
      handleComment,
      handleSendComment,
    }
  }
})
</script>

<style lang="less" scoped>
/* 主要内容区域 - 单列布局 */
.moment__main {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  -webkit-app-region: no-drag;
}

/* 动态列表区域 */
.moments-section {
  flex: 1;
  overflow-y: auto;
  background: #FFFFFF;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #F9FAFB;
  }

  &::-webkit-scrollbar-thumb {
    background: #B2BEC3;
    border-radius: 3px;

    &:hover {
      background: #636E72;
    }
  }
}

.moments-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
}

/* 状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #EBEEF5;
  border-top: 3px solid #FF7D45;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

.loading-text {
  font-size: 16px;
  font-weight: 500;
  color: #636E72;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
