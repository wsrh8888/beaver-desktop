<template>
  <div class="emoji__default">

    <div class="emoji-category-name">默认表情</div>
    <div class="emoji-grid">
      <div v-for="emoji in list" :key="emoji.name" class="emoji-item" :data-title="emoji.name" @click="onSelect(emoji)">
        <img :src="emoji.icon" :alt="emoji.name">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IEmojiBase } from 'renderModule/windows/app/pinia/emoji/emoji'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import { computed, defineComponent } from 'vue'

export default defineComponent({
  name: 'EmojiDefaultList',
  props: {
    onSelect: Function as unknown as () => ((emoji: IEmojiBase) => void) | undefined,
  },
  setup(props) {
    const emojiStore = useEmojiStore()
    const list = computed(() => emojiStore.defaultEmojis)

    const onSelect = (emoji: IEmojiBase) => {
      if (props.onSelect) {
        (props.onSelect as (e: IEmojiBase) => void)(emoji)
      }
    }

    return {
      list,
      onSelect,
    }
  },
})
</script>

<style lang="less" scoped>
.emoji__default {
  .emoji-category-name {
    font-size: 12px;
    color: #333;
    margin-bottom: 8px;
  }

  .emoji-grid {
    display: grid;
    grid-template-columns: repeat(10, minmax(0, 1fr));
    gap: 8px;

    .emoji-item {
      position: relative;
      width: 100%;
      aspect-ratio: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      border-radius: 6px;
      transition: background-color 0.15s, transform 0.15s;

      &:hover {
        background-color: rgba(0, 0, 0, 0.03);
        transform: scale(1.05);

        &::after {
          opacity: 1;
          transform: translate(-50%, -10px);
        }
      }

      &:active {
        transform: scale(0.95);
      }

      &::after {
        content: attr(data-title);
        position: absolute;
        left: 50%;
        bottom: 100%;
        transform: translate(-50%, -6px);
        padding: 4px 8px;
        background: rgba(0, 0, 0, 0.72);
        color: #fff;
        font-size: 11px;
        border-radius: 4px;
        white-space: nowrap;
        pointer-events: none;
        opacity: 0;
        transition: opacity 0.15s, transform 0.15s;
        z-index: 1;
      }

      img {
        width: 28px;
        height: 28px;
        object-fit: contain;
      }
    }
  }
}
</style>
