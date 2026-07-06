<template>
  <div class="circle-feed">
    <div v-if="!circleStore.currentCircleId" class="circle-feed-empty">
      <img src="renderModule/assets/image/leftBar/circle.svg" alt="圈子">
      <h3>选择一个圈子</h3>
      <p>从左侧选择一个已加入的圈子</p>
    </div>

    <template v-else>
      <div class="circle-feed-header">
        <div class="circle-feed-header-info">
          <h2>{{ circleStore.currentCircle?.name || '圈子' }}</h2>
          <p>{{ circleStore.currentCircle?.memberCount || 0 }} 成员 · {{ circleStore.postList.length }} 帖子</p>
        </div>
        <button
          v-if="canPost"
          class="circle-feed-header-btn"
          type="button"
          @click="circleStore.openCreatePost()"
        >
          <img src="renderModule/assets/image/moment/publish.svg" alt="发帖">
          发帖
        </button>
      </div>

      <div class="circle-feed-body">
        <div v-if="circleStore.loadingPosts" class="circle-feed-loading">
          加载中...
        </div>
        <div v-else-if="circleStore.postList.length === 0" class="circle-feed-empty circle-feed-empty-inline">
          <p>还没有帖子，来发第一条吧</p>
        </div>
        <CirclePostItem
          v-for="post in circleStore.postList"
          :key="post.postId"
          :post="post"
          @like="circleStore.toggleLike(post.postId)"
        />
      </div>
    </template>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import CirclePostItem from 'renderModule/windows/circle/components/postItem/index.vue'
import { useCircleStore } from 'renderModule/windows/circle/store/circle/circle'

export default defineComponent({
  name: 'CircleFeed',
  components: { CirclePostItem },
  setup() {
    const circleStore = useCircleStore()

    const canPost = computed(() => {
      const role = circleStore.currentCircle?.role || 0
      return role > 0
    })

    return {
      circleStore,
      canPost,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-feed {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;
}

.circle-feed-header {
  height: 64px;
  padding: 0 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
  flex-shrink: 0;
}

.circle-feed-header-info {
  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }

  p {
    margin: 4px 0 0;
    font-size: 12px;
    color: #636E72;
  }
}

.circle-feed-header-btn {
  height: 36px;
  padding: 0 16px;
  border: none;
  border-radius: 6px;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  color: #FFFFFF;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;

  img {
    width: 16px;
    height: 16px;
    filter: brightness(0) invert(1);
  }
}

.circle-feed-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px 24px 24px;
}

.circle-feed-loading,
.circle-feed-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #636E72;
  text-align: center;

  img {
    width: 48px;
    height: 48px;
    margin-bottom: 16px;
    opacity: 0.8;
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 600;
    color: #2D3436;
  }

  p {
    margin: 0;
    font-size: 13px;
  }
}

.circle-feed-empty-inline {
  height: auto;
  padding: 48px 16px;
}
</style>
