<template>
  <div class="emoji-grid">
    <div
      v-for="emoji in emojiList"
      :key="emoji.emojiId || emoji.name"
      class="emoji-item"
      @click="onSelectEmoji(emoji)"
    >
      <BeaverImage
        :file-name="emoji.icon"
        :alt="emoji.name"
        image-class="pkg-img"
      />
    </div>
  </div>
</template>

<script lang="ts">
import type { IEmojiBase } from 'renderModule/windows/app/pinia/emoji/emoji'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { defineComponent, ref, watchEffect } from 'vue'

export default defineComponent({
  name: 'EmojiPackageList',
  components: {
    BeaverImage,
  },
  props: {
    onSelect: Function as unknown as () => ((emoji: IEmojiBase) => void) | undefined,
    activePackageId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    const emojiStore = useEmojiStore()
    const emojiList = ref<IEmojiBase[]>([])

    const loadEmojis = async () => {
      if (!props.activePackageId) {
        emojiList.value = []
        return
      }

      // 先检查store中是否有数据
      let emojis = emojiStore.getPackageEmojis(props.activePackageId)
      if (emojis && emojis.length > 0) {
        emojiList.value = emojis
        return
      }

      // 如果store中没有数据，向主进程请求表情包详情
      try {
        const result = await electron.database.emoji.getEmojiPackagesByIds({
          ids: [props.activePackageId],
        })

        if (result?.packages && result.packages.length > 0) {
          const packageData = result.packages[0]
          if (packageData.emojis) {
            // 将表情数据转换为IEmojiBase格式
            const emojiData = packageData.emojis.map(emoji => ({
              emojiId: emoji.emojiId,
              name: emoji.title,
              icon: emoji.fileKey,
            }))
            // 将数据存储到store中
            emojiStore.packageEmojisMap[props.activePackageId] = emojiData
            emojiList.value = emojiData
          } else {
            emojiList.value = []
          }
        } else {
          emojiList.value = []
        }
      } catch (error) {
        console.error('获取表情包表情失败:', error)
        emojiList.value = []
      }
    }

    // 监听activePackageId变化
    watchEffect(() => {
      loadEmojis()
    })

    const onSelectEmoji = (emoji: IEmojiBase) => {
      if (props.onSelect) {
        (props.onSelect as (e: IEmojiBase) => void)(emoji)
      }
    }

    return {
      emojiList,
      onSelectEmoji,
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

      .pkg-img {
        transform: scale(1.12);
      }
    }

    &:active {
      .pkg-img {
        transform: scale(0.94);
      }
    }

    .pkg-img {
      max-width: 82%;
      max-height: 82%;
      width: auto;
      height: auto;
      object-fit: contain;
      transition: transform 0.16s ease;
    }
  }
}
</style>
