<template>
  <div class="emoji-popup" :style="{ bottom: `${menuHeight + 4}px` }" @click.stop>
    <div class="emoji-content custom-scrollbar">
      <component
        :is="activeComponent"
        :on-select="handleEmojiSelect"
        :on-add="handleAddFavorite"
      />
    </div>

    <div class="emoji-categories custom-scrollbar">
      <div class="emoji-category store-btn" @click="handleStoreClick">
        <div class="emoji-category-icon">
          <img :src="storeIcon" alt="商店">
        </div>
        <div class="emoji-category-name" />
      </div>

      <div
        v-for="tab in tabs"
        :key="tab.id"
        class="emoji-category"
        :class="{ active: activeTab === tab.id }"
        @click="handleTabClick(tab.id)"
      >
        <div class="emoji-category-icon">
          <img :src="tab.icon" :alt="tab.label">
        </div>
        <div class="emoji-category-name" />
      </div>

      <div
        v-for="tab in packageTabs"
        :key="tab.id"
        class="emoji-category"
        :class="{ active: activeTab === tab.id }"
        @click="handleTabClick(tab.id)"
      >
        <div class="emoji-category-icon">
          <img :src="tab.icon" :alt="tab.label">
        </div>
        <div class="emoji-category-name" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import favoriteIcon from 'renderModule/assets/image/emoji/favorite.svg'
import defaultIcon from 'renderModule/assets/image/emoji/smile.svg'
import storeIcon from 'renderModule/assets/image/emoji/store.svg'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import EmojiDefaultList from './components/default/index.vue'
import EmojiFavoriteList from './components/favorite/index.vue'
import EmojiPackageList from './components/package/index.vue'

export default defineComponent({
  name: 'EmojiComponent',
  props: {
    menuHeight: {
      type: Number,
      default: 0,
    },
  },
  emits: ['select', 'close', 'openStore', 'addFavorite'],
  setup(_props, { emit }) {
    const activeTab = ref<string>('default')

    const emojiStore = useEmojiStore()

    const tabs = [
      { id: 'default', label: '默认', icon: defaultIcon },
      { id: 'favorite', label: '收藏', icon: favoriteIcon },
    ]
    const packageTabs = computed(() => emojiStore.packageList.map(pkg => ({
      id: pkg.packageId,
      label: pkg.title,
      icon: pkg.coverFile || favoriteIcon,
    })))

    const activeComponent = computed(() => {
      if (activeTab.value === 'default')
        return EmojiDefaultList
      if (activeTab.value === 'favorite')
        return EmojiFavoriteList
      if (activeTab.value === 'package')
        return EmojiPackageList
      return EmojiDefaultList
    })

    const handleStoreClick = () => {
      emit('openStore')
    }

    const handleTabClick = (tabId: string) => {
      activeTab.value = tabId
      if (tabId === 'package') {
        // package 组件内部自行加载
      }
    }

    const handleEmojiSelect = (emoji: { name: string }) => {
      emit('select', emoji.name)
    }

    const handleAddFavorite = () => {
      emit('addFavorite')
    }

    // 点击外部区域关闭表情弹窗
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      const isEmojiPopup = !!target.closest('.emoji-popup')
      const isEmojiButton = !!target.closest('.toolbar-btn')
        && target.closest('.toolbar-btn')?.querySelector('img')?.alt === '表情'
      if (!isEmojiPopup && !isEmojiButton) {
        emit('close')
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      tabs,
      packageTabs,
      activeTab,
      activeComponent,
      storeIcon,
      handleStoreClick,
      handleTabClick,
      handleEmojiSelect,
      handleAddFavorite,
    }
  },
})
</script>

<style lang="less" scoped>
.emoji-popup {
  position: absolute;
  left: 2px;
  width: 420px;
  background-color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  border: 1px solid #EBEEF5;
  height: 305px;
  display: flex;
  flex-direction: column;
  .emoji-content {
    flex: 1;
    padding: 12px 16px;
    overflow: hidden;
  }

  .emoji-categories {
    display: flex;
    align-items: center;
    overflow-x: auto;
    height: 43px;
    background-color: #F5F7FA;

    &::-webkit-scrollbar {
      height: 0;
      display: none;
    }

    .emoji-category {
      flex-shrink: 0;
      // margin: 0 8px;
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border-radius: 6px;
      padding: 3px 10px;

      &:hover {
        background-color: rgba(0,0,0,0.03);
      }

      &.active {
        background-color: rgba(255, 125, 69, 0.08);
      }

      &.store-btn {
        margin-left: 0;
      }

      .emoji-category-icon {
        width: 28px;
        height: 28px;
        display: flex;
        align-items: center;
        justify-content: center;

        img {
          width: 22px;
          height: 22px;
          object-fit: contain;
        }
      }

      .emoji-category-name {
        font-size: 11px;
        color: #636E72;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 64px;
        text-align: center;
        line-height: 1.2;
      }
    }
  }
}

.custom-scrollbar {
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #e1e1e1;
    border-radius: 3px;

    &:hover {
      background-color: #d1d1d1;
    }
  }
}
</style>
