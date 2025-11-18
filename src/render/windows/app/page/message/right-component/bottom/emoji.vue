<template>
  <div class="emoji-popup" :style="{ bottom: `${menuHeight + 4}px` }" @click.stop>
    <div class="emoji-content custom-scrollbar">
      <h3 class="emoji-title">
        {{ currentCategory }}
      </h3>
      <div class="emoji-grid">
        <div
          v-for="emoji in currentEmojis"
          :key="emoji.name"
          class="emoji-item"
          @click="handleEmojiClick(emoji)"
        >
          <img :src="emoji.icon" :alt="emoji.name">
        </div>
      </div>
    </div>

    <div class="emoji-categories custom-scrollbar">
      <!-- 默认表情分类 -->
      <div
        class="emoji-category"
        :class="{ active: currentCategoryId === 'default' }"
        @click="handleDefaultCategoryClick"
      >
        <div class="emoji-category-icon">
          <img src="renderModule/assets/image/emoji/emoji.svg" alt="默认表情">
        </div>
        <div class="emoji-category-name">
          默认表情
        </div>
      </div>

      <!-- 其他表情包分类 -->
      <div
        v-for="category in categories"
        :key="category.packageId"
        class="emoji-category"
        :class="{ active: currentCategoryId === category.packageId }"
        @click="handleCategoryClick(category)"
      >
        <div class="emoji-category-icon">
          <img :src="category.coverFile" :alt="category.title">
        </div>
        <div class="emoji-category-name">
          {{ category.title }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IEmojiPackageItem } from 'commonModule/type/ajax/emoji'
import { getEmojiPackageDetailApi, getEmojiPackagesApi } from 'renderModule/api/emoji'
import { emojiList } from 'renderModule/windows/app/utils/emoji'
import { defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'

export default defineComponent({
  name: 'EmojiComponent',
  props: {
    menuHeight: {
      type: Number,
      default: 0,
    },
  },
  emits: ['select', 'close'],
  setup(_props, { emit }) {
    const categories = ref<IEmojiPackageItem[]>([])
    const currentCategoryId = ref<string | number>('default')
    const currentCategory = ref<string>('默认表情')
    const currentEmojis = ref<typeof emojiList>([])

    const loadCategories = async () => {
      try {
        const res = await getEmojiPackagesApi({
          page: 1,
          size: 10,
        })
        if (res.code === 0) {
          categories.value = res.result.list
        }
      }
      catch (error) {
        console.error('Failed to load emoji categories:', error)
      }
    }

    const handleDefaultCategoryClick = () => {
      currentCategoryId.value = 'default'
      currentCategory.value = '默认表情'
      currentEmojis.value = emojiList
    }

    const handleCategoryClick = async (category: IEmojiPackageItem) => {
      currentCategoryId.value = category.packageId
      currentCategory.value = category.title
      try {
        const res = await getEmojiPackageDetailApi({
          packageId: category.packageId,
        })
        if (res.code === 0) {
          currentEmojis.value = res.result.emojis.map(emoji => ({
            name: emoji.title,
            icon: emoji.fileId,
          }))
        }
      }
      catch (error) {
        console.error('Failed to load emoji details:', error)
      }
    }

    const handleEmojiClick = (emoji: { name: string, icon: string }) => {
      emit('select', emoji.name)
    }

    // 点击外部区域关闭表情弹窗
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement

      // 检查点击是否在表情弹窗内或表情按钮上
      const isEmojiPopup = !!target.closest('.emoji-popup')
      const isEmojiButton = !!target.closest('.toolbar-btn')
        && target.closest('.toolbar-btn')?.querySelector('img')?.alt === '表情'

      // 只有点击在弹窗和按钮外部时才关闭
      if (!isEmojiPopup && !isEmojiButton) {
        emit('close')
      }
    }

    onMounted(() => {
      loadCategories()
      handleDefaultCategoryClick()
      // 添加全局点击事件监听
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      // 移除事件监听
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      categories,
      currentCategoryId,
      currentCategory,
      currentEmojis,
      handleCategoryClick,
      handleDefaultCategoryClick,
      handleEmojiClick,
    }
  },
})
</script>

<style lang="less" scoped>
.emoji-popup {
  position: absolute;
  left: 2px;
  width: 460px;
  background-color: #FFFFFF;
  box-shadow: 0 8px 24px rgba(0,0,0,0.12);
  border-radius: 8px;
  overflow: hidden;
  z-index: 100;
  border: 1px solid #EBEEF5;
  height: 340px;
}

.emoji-content {
  height: 270px;
  padding: 16px 20px;
  overflow-y: auto;
}

.emoji-title {
  font-size: 14px;
  font-weight: 500;
  color: #2D3436;
  margin-bottom: 12px;
  padding-left: 4px;
}

.emoji-grid {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 12px;
}

.emoji-item {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: background-color 0.15s, transform 0.15s;
  position: relative;

  &:hover {
    background-color: rgba(0,0,0,0.03);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  img {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }
}

.emoji-categories {
  height: 70px;
  display: flex;
  align-items: center;
  border-top: 1px solid #EBEEF5;
  overflow-x: auto;
  padding: 0 10px;

  &::-webkit-scrollbar {
    height: 0;
    display: none;
  }
}

.emoji-category {
  min-width: 48px;
  height: 54px;
  flex-shrink: 0;
  margin: 0 8px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s;

  &:hover {
    background-color: rgba(0,0,0,0.03);
  }

  &.active {
    background-color: rgba(255, 125, 69, 0.08);

    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 50%;
      transform: translateX(-50%);
      width: 16px;
      height: 2px;
      background-color: #FF7D45;
      border-radius: 1px;
    }
  }
}

.emoji-category-icon {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;

  img {
    width: 24px;
    height: 24px;
    object-fit: contain;
  }
}

.emoji-category-name {
  font-size: 11px;
  color: #636E72;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 48px;
  text-align: center;
  line-height: 1.2;
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
