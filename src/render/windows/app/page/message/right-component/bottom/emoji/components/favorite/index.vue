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
    >
      <BeaverImage
        :file-name="emoji.fileKey"
        :cache-type="CacheType.USER_AVATAR"
        :alt="emoji.title"
        image-class="fav-img"
        :lazy-load="true"
      />
    </div>

  </div>
</template>

<script lang="ts">
import type { IFavoriteEmoji } from 'renderModule/windows/app/pinia/emoji/emoji'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import { computed, defineComponent } from 'vue'

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

    return {
      list,
      onSelect,
      onAdd,
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

}
</style>
