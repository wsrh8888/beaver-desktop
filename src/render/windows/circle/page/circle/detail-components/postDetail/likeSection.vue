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
  <div class="like-section">
    <div v-if="likes && likes.length > 0" class="likes-list">
      <div
        v-for="like in likes"
        :key="like.userId"
        class="like-item"
      >
        <div class="like-avatar">
          <BeaverImage :file-name="like.avatar" :cache-type="CacheType.USER_AVATAR" />
        </div>
        <div class="like-name">
          {{ like.userName }}
        </div>
      </div>
    </div>
    <div v-else class="empty-state">
      <span>暂无点赞</span>
    </div>
  </div>
</template>

<script lang="ts">
import type { ICirclePostLikeItem } from 'commonModule/type/ajax/circle'
import { CacheType } from 'commonModule/type/cache/cache'
import BeaverImage from 'renderModule/components/ui/image/index.vue'
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'CircleLikeSection',
  components: { BeaverImage },
  props: {
    likes: {
      type: Array as () => ICirclePostLikeItem[],
      default: () => [],
    },
  },
  setup() {
    return { CacheType }
  },
})
</script>

<style lang="less" scoped>
.like-section {
  padding: 16px 0;

  .likes-list {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(60px, 1fr));
    gap: 16px;

    .like-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      width: 50px;
      padding: 0 5px;

      .like-avatar {
        border-radius: 100%;
        overflow: hidden;
      }

      .like-name {
        font-size: 12px;
        font-weight: 500;
        color: #333333;
        text-align: center;
        overflow: hidden;
        text-overflow: clip;
        white-space: nowrap;
        max-width: 100%;
      }
    }
  }

  .empty-state {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    color: #999999;
    font-size: 14px;
  }
}
</style>
