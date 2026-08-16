<template>
  <div class="circle-page">
    <div class="circle-page__left">
      <CircleLeft
        ref="leftRef"
        :current-circle-id="selectedCircleId"
        @select="handleSelect"
        @create="showCreateCircle = true"
      />
    </div>

    <div class="circle-page__right">
      <CircleRight
        ref="rightRef"
        :circle-id="selectedCircleId"
        @show-details="showDetails = true"
        @show-post-detail="handleShowPostDetail"
      />
    </div>

    <CircleDetails
      :visible="showDetails"
      :circle-id="selectedCircleId"
      @close="showDetails = false"
      @quit="handleQuit"
      @updated="handleUpdated"
    />
    <CirclePostDetail
      v-if="activePost"
      :post="activePost"
      @close="activePost = null"
      @commented="handlePostChanged"
      @liked="handlePostChanged"
    />
    <CircleCreateModal
      v-if="showCreateCircle"
      @close="showCreateCircle = false"
      @success="handleCreated"
    />
  </div>
</template>

<script lang="ts">
import type { ICirclePostItem } from 'commonModule/type/ajax/circle'
import { defineComponent, ref } from 'vue'
import CircleCreateModal from 'renderModule/windows/circle/components/createCircle/index.vue'
import CircleDetails from 'renderModule/windows/circle/page/circle/detail-components/details/index.vue'
import CirclePostDetail from 'renderModule/windows/circle/page/circle/detail-components/postDetail/index.vue'
import CircleLeft from 'renderModule/windows/circle/page/circle/left-components/index.vue'
import CircleRight from 'renderModule/windows/circle/page/circle/right-component/index.vue'

export default defineComponent({
  name: 'CirclePage',
  components: {
    CircleLeft,
    CircleRight,
    CircleDetails,
    CirclePostDetail,
    CircleCreateModal,
  },
  setup(_props, { expose }) {
    const selectedCircleId = ref('')
    const showDetails = ref(false)
    const showCreateCircle = ref(false)
    const activePost = ref<ICirclePostItem | null>(null)
    const leftRef = ref<{ loadList: () => Promise<void> } | null>(null)
    const rightRef = ref<{
      loadAll: () => Promise<void>
      loadPosts: () => Promise<void>
      postList: ICirclePostItem[]
    } | null>(null)

    const handleSelect = (circleId: string) => {
      selectedCircleId.value = circleId
      showDetails.value = false
      activePost.value = null
    }

    const handleCreated = async (circleId: string) => {
      showCreateCircle.value = false
      await leftRef.value?.loadList()
      selectedCircleId.value = circleId
    }

    const handleQuit = async () => {
      showDetails.value = false
      activePost.value = null
      selectedCircleId.value = ''
      await leftRef.value?.loadList()
    }

    const handleUpdated = async () => {
      await leftRef.value?.loadList()
      await rightRef.value?.loadAll()
    }

    const handleShowPostDetail = (post: ICirclePostItem) => {
      activePost.value = post
    }

    const handlePostChanged = async () => {
      await rightRef.value?.loadPosts()
      if (activePost.value) {
        const latest = rightRef.value?.postList?.find(
          item => item.postId === activePost.value?.postId,
        )
        if (latest)
          activePost.value = latest
      }
    }

    const refresh = async () => {
      await leftRef.value?.loadList()
      await rightRef.value?.loadAll()
    }

    expose({ refresh })

    return {
      selectedCircleId,
      showDetails,
      showCreateCircle,
      activePost,
      leftRef,
      rightRef,
      handleSelect,
      handleCreated,
      handleQuit,
      handleUpdated,
      handleShowPostDetail,
      handlePostChanged,
      refresh,
    }
  },
})
</script>

<style lang="less" scoped>
.circle-page {
  flex: 1;
  min-height: 0;
  display: flex;
  position: relative;
  overflow: hidden;

  .circle-page__left {
    height: 100%;
    flex-shrink: 0;
    overflow-y: auto;
  }

  .circle-page__right {
    flex: 1;
    min-width: 0;
    height: 100%;
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
  }
}
</style>
