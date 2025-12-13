<template>
  <div class="package-wrapper">
    <div class="package-tabs custom-scrollbar">
      <div
        v-for="pkg in packageList"
        :key="pkg.packageId"
        class="package-tab"
        :class="{ active: pkg.packageId === activePackageId }"
        @click="onSelectPackage(pkg.packageId)"
      >
        <div class="icon">
          <img :src="pkg.coverFile" :alt="pkg.title">
        </div>
        <div class="name">
          {{ pkg.title }}
        </div>
      </div>
    </div>

    <div class="package-emojis custom-scrollbar">
      <div
        v-for="emoji in emojiList"
        :key="emoji.emojiId || emoji.name"
        class="emoji-item"
        @click="onSelectEmoji(emoji)"
      >
        <img :src="emoji.icon" :alt="emoji.name">
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { IEmojiBase } from 'renderModule/windows/app/pinia/emoji/emoji'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import { computed, defineComponent, ref, watchEffect } from 'vue'

export default defineComponent({
  name: 'EmojiPackageList',
  props: {
    onSelect: Function as unknown as () => ((emoji: IEmojiBase) => void) | undefined,
  },
  setup(props) {
    const emojiStore = useEmojiStore()
    const packageList = computed(() => emojiStore.packageList)
    const activePackageId = ref<string>('')

    watchEffect(() => {
      if (!activePackageId.value && packageList.value.length > 0) {
        activePackageId.value = packageList.value[0].packageId
      }
    })

    const emojiList = computed(() => {
      if (!activePackageId.value)
        return [] as IEmojiBase[]
      return emojiStore.getPackageEmojis(activePackageId.value)
    })

    const onSelectPackage = (packageId: string) => {
      activePackageId.value = packageId
      // 如需拉取，可在此调用主进程并写入 store
    }

    const onSelectEmoji = (emoji: IEmojiBase) => {
      if (props.onSelect) {
        (props.onSelect as (e: IEmojiBase) => void)(emoji)
      }
    }

    return {
      packageList,
      emojiList,
      activePackageId,
      onSelectPackage,
      onSelectEmoji,
    }
  },
})
</script>

<style lang="less" scoped>
.package-wrapper {
  display: flex;
  height: 270px;
}

.package-tabs {
  width: 90px;
  border-right: 1px solid #EBEEF5;
  overflow-y: auto;
  padding: 8px 6px;

  .package-tab {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 8px 4px;
    border-radius: 6px;
    cursor: pointer;
    transition: background-color 0.15s;
    margin-bottom: 6px;

    &:hover {
      background-color: rgba(0,0,0,0.03);
    }

    &.active {
      background-color: rgba(255, 125, 69, 0.08);
    }

    .icon {
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 4px;

      img {
        width: 32px;
        height: 32px;
        object-fit: contain;
      }
    }

    .name {
      font-size: 11px;
      color: #636E72;
      text-align: center;
      line-height: 1.2;
    }
  }
}

.package-emojis {
  flex: 1;
  padding: 12px 16px;
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 12px;

  .emoji-item {
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border-radius: 6px;
    transition: background-color 0.15s, transform 0.15s;

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
