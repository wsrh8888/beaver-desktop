<template>
  <div class="emoji-grid">
    <div class="emoji-item add-item" @click="onAdd">
      <span class="plus">+</span>
    </div>
    <div
      v-for="emoji in list"
      :key="emoji.emojiId"
      class="emoji-item"
      @click="onSelect(emoji)"
      @contextmenu.prevent="openContextMenu($event, emoji)"
    >
      <BeaverImage
        :file-name="emoji.fileKey"
        :cache-type="CacheType.USER_AVATAR"
        :alt="emoji.title"
        image-class="fav-img"
        :lazy-load="true"
      />
    </div>

    <div
      v-if="contextMenu.visible"
      class="emoji-fav-context"
      :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
      @click.stop
    >
      <div class="context-item" @click="handleRemove">
        删除
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IFavoriteEmoji } from 'renderModule/windows/app/pinia/emoji/emoji'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import { computed, defineComponent, onBeforeUnmount, onMounted, reactive } from 'vue'

export default defineComponent({
  name: 'EmojiFavoriteList',
  components: {
    BeaverImage,
  },
  props: {
    onSelect: Function as unknown as () => ((emoji: { name: string, icon: string }) => void) | undefined,
    onSend: Function as unknown as () => ((emoji: { emojiId: string, fileKey: string, packageId?: string }) => void) | undefined,
    onAdd: Function as unknown as () => (() => void) | undefined,
  },
  setup(props) {
    const emojiStore = useEmojiStore()
    const list = computed(() => emojiStore.getFavoriteEmojis)

    const contextMenu = reactive({
      visible: false,
      x: 0,
      y: 0,
      target: null as IFavoriteEmoji | null,
    })

    const onSelect = (emoji: IFavoriteEmoji) => {
      // 如果是图片表情（有emojiId），直接发送消息
      if (emoji.emojiId && props.onSend) {
        (props.onSend as (e: { emojiId: string, fileKey: string, packageId?: string, width?: number, height?: number }) => void)({
          emojiId: emoji.emojiId,
          fileKey: emoji.fileKey,
          packageId: emoji.packageId,
          width: emoji.emojiInfo?.width,
          height: emoji.emojiInfo?.height,
        })
      }
    }

    const onAdd = () => {
      if (props.onAdd) {
        (props.onAdd as () => void)()
      }
    }

    const openContextMenu = (event: MouseEvent, emoji: IFavoriteEmoji) => {
      contextMenu.visible = true
      contextMenu.x = event.clientX
      contextMenu.y = event.clientY
      contextMenu.target = emoji
    }

    const closeContextMenu = () => {
      contextMenu.visible = false
      contextMenu.target = null
    }

    const handleRemove = () => {
      if (contextMenu.target) {
        emojiStore.removeFavorite(contextMenu.target)
      }
      closeContextMenu()
    }

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.emoji-fav-context')) {
        closeContextMenu()
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleClickOutside)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside)
    })

    return {
      list,
      onSelect,
      onAdd,
      contextMenu,
      openContextMenu,
      handleRemove,
      BeaverImage,
      CacheType,
    }
  },
})
</script>

<style lang="less" scoped>
.emoji-grid {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  position: relative;

  .emoji-item {
    width: 100%;
    aspect-ratio: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 6px;
    background-color: #fff;
    box-shadow: inset 0 0 0 1px rgba(0,0,0,0.04);
    transition: background-color 0.16s ease, box-shadow 0.16s ease;

    &:hover {
      background-color: rgba(0,0,0,0.02);
      box-shadow: 0 6px 18px rgba(0,0,0,0.12);

      .fav-img {
        transform: scale(1.12);
      }
    }

    &:active {
      .fav-img {
        transform: scale(0.94);
      }
    }

    .fav-img {
      max-width: 82%;
      max-height: 82%;
      width: auto;
      height: auto;
      object-fit: contain;
      transition: transform 0.16s ease;
    }

    &.add-item {
      border: 1px dashed #d9d9d9;
      color: #999;
      box-shadow: none;

      .plus {
        font-size: 20px;
        line-height: 1;
      }
    }
  }

  .emoji-fav-context {
    position: fixed;
    min-width: 96px;
    background: #ffffff;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    border: 1px solid #ebeef5;
    border-radius: 6px;
    z-index: 9999;
    padding: 6px 0;

    .context-item {
      padding: 8px 14px;
      font-size: 13px;
      color: #ff4d4f;
      cursor: pointer;
      line-height: 1.4;

      &:hover {
        background-color: rgba(255, 77, 79, 0.08);
      }
    }
  }
}
</style>
