<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  中文：
  本文件为海狸 IM（Beaver IM）开源项目源代码。
  版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
  禁止删除、篡改或替换本文件头部版权与许可声明。
  使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html

  English:
  This file is part of the Beaver IM open-source project.
  Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
  Do not remove, alter, or replace this copyright and license header.
  Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html

  beaver-desktop-header-v2
-->

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
import Logger from 'renderModule/utils/logger';
const logger = new Logger('index')

import type { IEmojiBase } from 'renderModule/windows/app/pinia/emoji/emoji'
import { useEmojiStore } from 'renderModule/windows/app/pinia/emoji/emoji'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent, ref, watchEffect } from 'vue'

export default defineComponent({
  name: 'EmojiPackageList',
  components: {
    BeaverImage,
  },
  props: {
    onSelect: Function as unknown as () => ((emoji: IEmojiBase) => void) | undefined,
    onSend: Function as unknown as () => ((emoji: { emojiId: string, fileKey: string, packageId?: string }) => void) | undefined,
    packageId: {
      type: String,
      default: '',
    },
  },
  setup(props) {
    logger.info({ text: 'setup 开始' })
    const emojiStore = useEmojiStore()
    const emojiList = computed(() => emojiStore.getPackageEmojis(props.packageId))

    const loadEmojis = async () => {
    logger.info({ text: 'loadEmojis 开始' })
      if (!props.packageId) {
        return
      }

      // 先检查store中是否有数据
      await emojiStore.initPackageEmojis(props.packageId)
   
    }

    // 监听packageId变化
    watchEffect(() => {
      loadEmojis()
    })

    const onSelectEmoji = (emoji: IEmojiBase) => {
    logger.info({ text: 'onSelectEmoji 开始' })
      // 如果是图片表情（有emojiId），直接发送消息
      if (emoji.emojiId && props.onSend) {
        (props.onSend as (e: { emojiId: string, fileKey: string, packageId?: string, width?: number, height?: number }) => void)({
          emojiId: emoji.emojiId,
          fileKey: emoji.icon,
          packageId: props.packageId,
          // width 和 height 暂时设为 undefined，之后可以通过图片信息获取
          width: undefined,
          height: undefined,
        })
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
