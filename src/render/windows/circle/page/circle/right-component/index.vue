<template>
  <div class="circle-right">
    <template v-if="circleId">
      <div class="circle-right-header">
        <div class="circle-right-header-left">
          <h2>{{ circleName }}</h2>
          <span class="circle-right-badge">圈子</span>
        </div>
        <button class="circle-right-more" type="button" @click="handleShowDetails">
          <img src="renderModule/assets/image/chat/more.svg" alt="更多">
        </button>
      </div>

      <div class="circle-right-body">
        <CirclePostItem
          v-for="post in postList"
          :key="post.postId"
          :post="post"
          @like="toggleLike(post.postId)"
          @comment="openPostDetail(post)"
        />
      </div>

      <button
        v-if="canPost"
        class="circle-right-publish-btn"
        type="button"
        @click="showCreatePost = true"
      >
        <img src="renderModule/assets/image/moment/publish.svg" alt="发帖" class="circle-right-publish-icon">
      </button>
    </template>

    <CirclePostModal
      v-if="showCreatePost && circleId"
      :circle-id="circleId"
      @close="showCreatePost = false"
      @success="handlePostCreated"
    />
  </div>
</template>

<script lang="ts">
import type { ICirclePostItem, IGetCircleDetailRes } from 'commonModule/type/ajax/circle'
import { computed, defineComponent, ref, watch } from 'vue'
import {
  getCircleDetailApi,
  getPostListApi,
  likePostApi,
} from 'renderModule/api/circle'
import Message from 'renderModule/components/ui/message'
import CirclePostModal from 'renderModule/windows/circle/components/createPost/index.vue'
import CirclePostItem from 'renderModule/windows/circle/page/circle/right-component/components/postItem/index.vue'
import { parseCircleId } from 'renderModule/windows/circle/store/circle/circle'

export default defineComponent({
  name: 'CircleRight',
  components: {
    CirclePostItem,
    CirclePostModal,
  },
  props: {
    circleId: {
      type: String,
      default: '',
    },
  },
  emits: ['show-details', 'show-post-detail'],
  setup(props, { emit, expose }) {
    const detail = ref<IGetCircleDetailRes | null>(null)
    const postList = ref<ICirclePostItem[]>([])
    const loading = ref(false)
    const showCreatePost = ref(false)

    const normalizedId = computed(() => parseCircleId(props.circleId || ''))

    const circleName = computed(() => detail.value?.name || '圈子')
    const canPost = computed(() => (detail.value?.role || 0) > 0)

    const loadDetail = async () => {
      const id = normalizedId.value
      if (!id)
        return
      const res = await getCircleDetailApi({ circleId: id })
      if (res.code !== 0) {
        Message.error(res.msg || '获取圈子详情失败')
        detail.value = null
        return
      }
      detail.value = res.result
    }

    const loadPosts = async () => {
      const id = normalizedId.value
      if (!id)
        return
      loading.value = true
      const res = await getPostListApi({
        circleId: id,
        page: 1,
        limit: 50,
      })
      loading.value = false
      if (res.code !== 0) {
        Message.error(res.msg || '获取帖子失败')
        return
      }
      postList.value = res.result.list || []
    }

    const loadAll = async () => {
      const id = normalizedId.value
      if (!id) {
        detail.value = null
        postList.value = []
        showCreatePost.value = false
        return
      }
      showCreatePost.value = false
      await Promise.all([loadDetail(), loadPosts()])
    }

    watch(
      () => props.circleId,
      () => {
        loadAll()
      },
      { immediate: true },
    )

    const handleShowDetails = () => {
      emit('show-details')
    }

    const toggleLike = async (postId: string) => {
      const target = postList.value.find(item => item.postId === postId)
      if (!target)
        return
      const nextStatus = !target.isLiked
      const res = await likePostApi({ postId, status: nextStatus })
      if (res.code !== 0) {
        Message.error(res.msg || '操作失败')
        return
      }
      target.isLiked = nextStatus
      target.likeCount = Math.max(0, target.likeCount + (nextStatus ? 1 : -1))
    }

    const openPostDetail = (post: ICirclePostItem) => {
      emit('show-post-detail', post)
    }

    const handlePostCreated = async () => {
      showCreatePost.value = false
      await loadPosts()
    }

    expose({
      loadAll,
      loadPosts,
      detail,
      postList,
    })

    return {
      detail,
      postList,
      loading,
      showCreatePost,
      circleName,
      canPost,
      handleShowDetails,
      toggleLike,
      openPostDetail,
      handlePostCreated,
      loadAll,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-right {
  flex: 1;
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;
  position: relative;
  overflow: hidden;
}

.circle-right-header {
  height: 56px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #FFFFFF;
  border-bottom: 1px solid #EBEEF5;
  flex-shrink: 0;
}

.circle-right-header-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.circle-right-badge {
  flex-shrink: 0;
  height: 20px;
  padding: 0 8px;
  border-radius: 4px;
  background: #E8F8EF;
  color: #16A34A;
  font-size: 12px;
  font-weight: 600;
  line-height: 20px;
}

.circle-right-more {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;

  img {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: #F5F6F8;
  }
}

.circle-right-body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 24px;
}

.circle-right-publish-btn {
  position: absolute;
  right: 24px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(255, 125, 69, 0.3);
  z-index: 10;

  &:hover {
    box-shadow: 0 6px 20px rgba(255, 125, 69, 0.4);
  }

  &:active {
    transform: scale(0.95);
  }
}

.circle-right-publish-icon {
  width: 24px;
  height: 24px;
  filter: brightness(0) invert(1);
}
</style>
