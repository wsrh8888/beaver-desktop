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
  <div class="message-emoji">
    <div class="emoji-content" :style="{ width: emojiSize.width + 'px', height: emojiSize.height + 'px' }">
      <BeaverImage :file-name="msg.emojiMsg?.fileUrl || ''" alt="表情" image-class="emoji-image" />
    </div>
  </div>
</template>

<script lang="ts">
import { IMessageMsg } from 'commonModule/type/ws/message-types'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { computed, defineComponent, PropType } from 'vue'

export default defineComponent({
  name: 'EmojiMessage',
  components: {
    BeaverImage,
  },
  props: {
    msg: {
      type: Object as PropType<IMessageMsg>,
      required: true,
    },
  },
  setup(props) {
    // 计算表情显示尺寸
    const emojiSize = computed(() => {
      if (props.msg.type === 6 && props.msg.emojiMsg) {
        const emojiMsg = props.msg.emojiMsg
        const width = emojiMsg.width || 64
        const height = emojiMsg.height || 64

        // 限制最大尺寸，避免过大的表情影响聊天体验
        const maxSize = 120
        const minSize = 32

        // 如果图片太大，按比例缩放
        if (width > maxSize || height > maxSize) {
          const ratio = Math.min(maxSize / width, maxSize / height)
          return {
            width: Math.max(minSize, Math.round(width * ratio)),
            height: Math.max(minSize, Math.round(height * ratio))
          }
        }

        // 如果图片太小，保持最小尺寸
        return {
          width: Math.max(minSize, width),
          height: Math.max(minSize, height)
        }
      }

      // 默认尺寸
      return { width: 64, height: 64 }
    })

    return {
      emojiSize,
    }
  },
})
</script>

<style lang="less" scoped>
.message-emoji {
  .emoji-content {
    display: flex;
    align-items: center;
    justify-content: center;

    .emoji-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
      border-radius: 6px;
    }
  }
}
</style>
