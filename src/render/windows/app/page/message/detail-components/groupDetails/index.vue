<template>
  <div class="group-details app__no_drag" >
    <div
      class="group-details__sidebar app__no_drag"
      :class="{ 'group-details__sidebar--active': isVisible }"
    >
      <div class="group-details__header">
        <button
          v-if="currentPage.leftIcon"
          class="group-details__header-btn"
          type="button"
          @click="handleHeaderAction('left')"
        >
          <img src="renderModule/assets/image/common/back.svg" alt="返回">
        </button>

        <h3 class="group-details__title">
          {{ currentPage.title }}
        </h3>

        <button
          v-if="currentPage.rightIcon"
          class="group-details__header-btn"
          type="button"
          @click="handleHeaderAction('right')"
        >
          <img src="renderModule/assets/image/group/close.svg" alt="关闭">
        </button>
      </div>

      <div class="group-details__body">
        <group-details-info
          v-if="page === pageConfig.info.value"
          @open="handleOpen"
          @close="handleClose"
        />
        <group-details-assistant
          v-else-if="page === pageConfig.assistant.value"
          @open="handleOpen"
          @close="handleClose"
        />
      </div>
    </div>

    <div
      class="group-details__overlay"
      :class="{ 'group-details__overlay--active': isVisible }"
      @click="closeDetails"
    />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref, watch } from 'vue'
import groupDetailsAssistant from './assistant.vue'
import groupDetailsInfo from './info.vue'
type PageKey = 'info' | 'assistant'

const pageConfig: Record<PageKey, {
  title: string
  value: PageKey
  leftIcon: boolean
  rightIcon: boolean
}> = {
  info: {
    title: '群聊详情',
    value: 'info',
    leftIcon: false,
    rightIcon: true,
  },
  assistant: {
    title: '智能群助手',
    value: 'assistant',
    leftIcon: true,
    rightIcon: true,
  },
}

export default defineComponent({
  name: 'groupDetails',
  components: {
    groupDetailsInfo,
    groupDetailsAssistant,
  },
  props: {
    visible: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['update:visible', 'close'],
  setup(props, { emit }) {
    const isVisible = ref(props.visible)
    const page = ref<PageKey>(pageConfig.info.value)

    const currentPage = computed(() => pageConfig[page.value])

    watch(() => props.visible, (newVal) => {
      isVisible.value = newVal
      if (!newVal)
        page.value = pageConfig.info.value
    })

    const closeDetails = () => {
      page.value = pageConfig.info.value
      isVisible.value = false
      emit('update:visible', false)
      emit('close')
    }

    const handleOpen = (target: PageKey = pageConfig.assistant.value) => {
      if (target === pageConfig.info.value || target === pageConfig.assistant.value)
        page.value = target
    }

    const handleClose = () => {
      if (page.value === pageConfig.assistant.value)
        page.value = pageConfig.info.value
      else
        closeDetails()
    }

    const handleHeaderAction = (side: 'left' | 'right') => {
      console.error('1111111111111111', side, page.value)
      if (side === 'left' && page.value === pageConfig.assistant.value)
        page.value = pageConfig.info.value
      if (side === 'right' && page.value === pageConfig.info.value)
        closeDetails()
    }

    return {
      pageConfig,
      isVisible,
      page,
      currentPage,
      closeDetails,
      handleOpen,
      handleClose,
      handleHeaderAction,
    }
  },
})
</script>

<style lang="less" scoped>
.group-details {
  
  .group-details__sidebar {
    position: fixed;
    top: 0;
    right: -360px;
    width: 360px;
    height: 100%;
    background-color: #ffffff;
    border-left: 1px solid #ebeef5;
    z-index: 100;
    transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);
    display: flex;
    flex-direction: column;
    box-shadow: -4px 0 16px rgba(0, 0, 0, 0.08);
    overflow: hidden;
  }

  .group-details__sidebar--active {
    right: 0;
  }

  .group-details__header {
    height: 64px;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    align-items: center;
    padding: 0 16px 0 12px;
    flex-shrink: 0;
  }

  .group-details__header-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: transparent;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    padding: 0;
    flex-shrink: 0;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .group-details__header-placeholder {
    width: 32px;
    height: 32px;
    flex-shrink: 0;
  }

  .group-details__title {
    flex: 1;
    font-size: 16px;
    font-weight: 500;
    color: #2d3436;
    margin: 0;
    text-align: left;
    padding: 0 8px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .group-details__body {
    flex: 1;
    overflow: hidden;
    display: flex;
    flex-direction: column;
  }

  .group-details__overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 90;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s;
  }

  .group-details__overlay--active {
    opacity: 1;
    pointer-events: auto;
  }
}
</style>
