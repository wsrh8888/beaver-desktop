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
  <!-- 表情包列表项 -->
  <div class="emoji-package-item" @click="handleClick">
    <!-- 左侧信息区域 -->
    <div class="package-info">
      <div class="package-title">{{ packageData.title }}</div>
      <div class="package-description">{{ packageData.description || '暂无描述' }}</div>
      <div class="package-preview">
        <div class="preview-emojis">
          <div
            v-for="(emoji, index) in packageData.recentEmojis"
            :key="emoji.emojiId"
            class="preview-emoji"
            v-show="index < 6"
          >
            <BeaverImage
              :file-name="emoji.fileKey"
              alt="表情"
              image-class="preview-emoji-image"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 右侧操作区域 -->
    <div class="package-actions">
      <BeaverButton
        type="primary"
        size="small"
        :disabled="packageData.isCollected"
        @click.stop="handleCollect"
      >
        {{ packageData.isCollected ? '已收藏' : '添加' }}
      </BeaverButton>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverImage from 'renderModule/components/ui/image/index.vue'

export default defineComponent({
  name: 'EmojiPackageItem',
  components: {
    BeaverButton,
    BeaverImage,
  },
  props: {
    packageData: {
      type: Object,
      required: true,
    },
  },
  emits: ['click', 'collect'],
  setup(props, { emit }) {
    // 点击表情包
    const handleClick = () => {
      emit('click', props.packageData)
    }

    // 收藏表情包
    const handleCollect = () => {
      emit('collect', props.packageData)
    }

    return {
      handleClick,
      handleCollect,
    }
  },
})
</script>

<style lang="less" scoped>
.emoji-package-item {
  display: flex;
  // align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid #F0F2F5;
  cursor: pointer;
  background-color: #FAFBFC;
  border-radius: 12px;
  height: 140px;


  .package-info {
    flex: 1;
    margin-right: 16px;

    .package-title {
      font-size: 16px;
      font-weight: 500;
      color: #2D3436;
      margin-bottom: 10px;
    }

    .package-description {
      font-size: 14px;
      color: #a0a7af;
      margin-bottom: 12px;
      line-height: 1.4;
    }

    .package-preview {
      .preview-emojis {
        display: flex;
        gap: 20px;

        .preview-emoji {
          width: 50px;
          height: 50px;
          overflow: hidden;
          flex-shrink: 0;

          .preview-emoji-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
        }
      }
    }
  }

  .package-actions {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
