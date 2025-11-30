<template>
  <div class="like-section">
    <div class="likes-list" v-if="likes && likes.length > 0">
      <div
        v-for="like in likes"
        :key="like.id"
        class="like-item"
      >
        <div class="like-avatar">
          <BeaverImage :file-name="like.avatar" :cache-type="CacheType.USER_AVATAR" />
        </div>
        <div class="like-name">
          {{ like.userName || like.nickName }}
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <span>暂无点赞</span>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { CacheType } from 'commonModule/type/cache/cache'

export default defineComponent({
  name: 'LikeSection',
  components: {
    BeaverImage,
  },
  props: {
    likes: {
      type: Array,
      default: () => []
    }
  },
  setup() {
    return {
      CacheType,
    }
  }
})
</script>

<style lang="less" scoped>
.like-section {
  padding: 16px 0;

  .likes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 16px;

    .like-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 50px;
      padding: 0 5px;
      .like-avatar {
        border-radius: 100%;
        overflow: hidden;
      }

      .like-name {
        font-size: 12px;
        font-weight: 500;
        color: #333333;
        text-align: center;
        overflow: hidden;
        text-overflow: clip;
        white-space: nowrap;
        max-width: 100%;
      }
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #999999;
    font-size: 14px;
  }
}
</style>
