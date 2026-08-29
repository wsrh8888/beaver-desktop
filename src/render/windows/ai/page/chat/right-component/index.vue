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
  <aside class="ai-result-panel">
    <div class="ai-result-panel__head">
      <div class="ai-result-panel__tabs">
        <button
          v-for="a in artifacts"
          :key="a.id"
          class="ai-result-panel__tab"
          :class="{ active: a.id === activeId }"
          type="button"
          :title="a.name"
          @click="select(a.id)"
        >
          <span class="ai-result-panel__tab-type" :class="`is-${a.type}`">{{ typeMark(a.type) }}</span>
          <span class="ai-result-panel__tab-name">{{ a.name }}</span>
          <span class="ai-result-panel__tab-close" @click.stop="remove(a.id)">×</span>
        </button>
      </div>
      <div class="ai-result-panel__actions">
        <button class="ai-result-panel__btn" type="button" title="上传" disabled>
          上传
        </button>
        <button class="ai-result-panel__btn" type="button" title="分享" disabled>
          分享
        </button>
        <button class="ai-result-panel__btn" type="button" title="收起" @click="aiViewStore.toggleResultPanel()">
          收起
        </button>
      </div>
    </div>

    <div class="ai-result-panel__body">
      <template v-if="active">
        <AiArtifactMd v-if="active.type === 'md'" :content="active.content" />
        <AiArtifactHtml v-else-if="active.type === 'html'" :content="active.content" />
      </template>
      <div v-else class="ai-result-panel__empty">
        <img src="renderModule/assets/image/moment/file.svg" alt="empty">
        <h3>暂无产物</h3>
        <p>会话产出后会在此以 tab 形式展示</p>
      </div>
    </div>
  </aside>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import type { AiArtifactType } from 'renderModule/windows/ai/types/chat'
import AiArtifactMd from './renderers/md.vue'
import AiArtifactHtml from './renderers/html.vue'
import { useAiChatStore } from 'renderModule/windows/ai/pinia/chat'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

/**
 * 右侧产物面板（对齐 WorkBuddy）：
 * - 顶部浏览器式 tab：每个 tab = 一个产物（带名字 + 类型），非按类型分。
 * - md 可多 tab；html 整页渲染，同一会话仅 1 个（store 侧强制单例）。
 * - 右上操作：上传 / 分享 / 收起。
 * - body 按产物类型选渲染器。
 */
export default defineComponent({
  name: 'AiResultPanel',
  components: { AiArtifactMd, AiArtifactHtml },
  setup() {
    const aiChatStore = useAiChatStore()
    const aiViewStore = useAiViewStore()

    const artifacts = computed(() => aiChatStore.currentArtifacts)
    const activeId = computed(() => aiViewStore.activeArtifactId)
    const active = computed(() => artifacts.value.find(a => a.id === activeId.value))

    const typeMark = (t: AiArtifactType) => (t === 'html' ? 'HTML' : 'MD')

    const select = (id: string) => aiViewStore.setActiveArtifact(id)
    const remove = (id: string) => {
      const chatId = aiChatStore.currentChatId
      if (chatId)
        aiChatStore.removeArtifact(chatId, id)
    }

    return { aiViewStore, artifacts, activeId, active, typeMark, select, remove }
  },
})
</script>

<style lang="less" scoped>
.ai-result-panel {
  width: 380px;
  flex-shrink: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-left: 1px solid #EBEEF5;

  &__head {
    height: 40px;
    display: flex;
    align-items: stretch;
    border-bottom: 1px solid #EBEEF5;
    flex-shrink: 0;
  }

  &__tabs {
    flex: 1;
    min-width: 0;
    display: flex;
    align-items: stretch;
    overflow-x: auto;
    padding: 0 4px;
    scrollbar-width: none;

    &::-webkit-scrollbar {
      display: none;
    }
  }

  &__tab {
    flex: 0 0 auto;
    max-width: 160px;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 0 8px 0 10px;
    border: none;
    border-right: 1px solid #F2F4F8;
    background: transparent;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;
    position: relative;
    transition: background 150ms ease;

    &:hover {
      background: #F9FAFB;
    }

    &.active {
      color: #2D3436;
      background: #FFFFFF;

      &::after {
        content: '';
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: 2px;
        background: #FF7D45;
      }
    }
  }

  &__tab-type {
    flex-shrink: 0;
    font-size: 9px;
    font-weight: 600;
    letter-spacing: 0.3px;
    padding: 1px 4px;
    border-radius: 3px;
    line-height: 1.4;

    &.is-md {
      color: #4A6FA1;
      background: #D9E6FF;
    }

    &.is-html {
      color: #E86835;
      background: #FFE6D9;
    }
  }

  &__tab-name {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tab-close {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    color: #B2BEC3;
    font-size: 14px;
    line-height: 1;

    &:hover {
      background: rgba(0, 0, 0, 0.06);
      color: #2D3436;
    }
  }

  &__actions {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 0 8px;
  }

  &__btn {
    height: 26px;
    padding: 0 10px;
    border: 1px solid #EBEEF5;
    border-radius: 5px;
    background: #FFFFFF;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;

    &:hover:not(:disabled) {
      border-color: #FF7D45;
      color: #FF7D45;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__body {
    flex: 1;
    min-height: 0;
    overflow: hidden;
    background: #F9FAFB;
  }

  &__empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;

    img {
      width: 32px;
      height: 32px;
      opacity: 0.45;
      margin-bottom: 16px;
    }

    h3 {
      margin: 0 0 8px;
      font-size: 14px;
      font-weight: 500;
      color: #2D3436;
    }

    p {
      margin: 0;
      font-size: 12px;
      color: #B2BEC3;
    }
  }
}
</style>
