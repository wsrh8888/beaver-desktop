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
  <div ref="rootRef" class="ai-space-picker">
    <button
      class="ai-space-picker__trigger"
      type="button"
      :class="{ open: open }"
      @click="toggle"
    >
      <img src="renderModule/assets/image/moment/file.svg" alt="">
      <span class="ai-space-picker__label">{{ currentLabel }}</span>
      <span class="ai-space-picker__chevron" />
    </button>

    <div v-if="open" class="ai-space-picker__panel" @click.stop>
      <div class="ai-space-picker__search">
        <img src="renderModule/assets/image/friend/search.svg" alt="">
        <input
          ref="searchRef"
          v-model="keyword"
          type="text"
          placeholder="搜索工作空间"
          @keydown.stop
        >
      </div>

      <div class="ai-space-picker__list">
        <button
          v-for="space in filteredSpaces"
          :key="space.id"
          class="ai-space-picker__item"
          :class="{ active: aiSpaceStore.selectedSpaceId === space.id }"
          type="button"
          @click="pickSpace(space.id)"
        >
          <img src="renderModule/assets/image/moment/file.svg" alt="">
          <span class="ai-space-picker__item-name">{{ space.name }}</span>
        </button>
        <div
          v-if="filteredSpaces.length === 0"
          class="ai-space-picker__empty"
        >
          {{ keyword.trim() ? '无匹配工作空间' : '暂无工作空间' }}
        </div>
      </div>

      <div class="ai-space-picker__footer">
        <button class="ai-space-picker__action" type="button" @click="createSpace">
          <img src="renderModule/assets/image/common/add.svg" alt="">
          新建工作空间
        </button>
        <button class="ai-space-picker__action" type="button" @click="openLocalFolder">
          <img src="renderModule/assets/image/common/file.svg" alt="">
          打开本地文件夹
        </button>
        <div class="ai-space-picker__divider" />
        <button
          class="ai-space-picker__action"
          :class="{ active: aiSpaceStore.selectedSpaceId === null }"
          type="button"
          @click="pickNone"
        >
          不使用工作空间
        </button>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import Logger from 'renderModule/utils/logger';
const logger = new Logger('index')

import { computed, defineComponent, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useAiGlobalStore } from 'renderModule/windows/ai/pinia/global'
import { useAiSpaceStore } from 'renderModule/windows/ai/pinia/space'

export default defineComponent({
  name: 'AiSpacePicker',
  setup() {
    logger.info({ text: 'setup 开始' })
    const aiSpaceStore = useAiSpaceStore()
    const aiGlobalStore = useAiGlobalStore()
    const open = ref(false)
    const keyword = ref('')
    const rootRef = ref<HTMLElement | null>(null)
    const searchRef = ref<HTMLInputElement | null>(null)

    const currentLabel = computed(() => {
      if (!aiSpaceStore.selectedSpaceId)
        return '不使用工作空间'
      return aiSpaceStore.selectedSpace?.name || '选择工作空间'
    })

    const filteredSpaces = computed(() => {
      const q = keyword.value.trim().toLowerCase()
      if (!q)
        return aiSpaceStore.localSpaces
      return aiSpaceStore.localSpaces.filter(item => item.name.toLowerCase().includes(q))
    })

    const close = () => {
    logger.info({ text: 'close 开始' })
      open.value = false
      keyword.value = ''
    }

    const toggle = async () => {
    logger.info({ text: 'toggle 开始' })
      open.value = !open.value
      if (open.value) {
        keyword.value = ''
        await nextTick()
        searchRef.value?.focus()
      }
    }

    const pickNone = () => {
    logger.info({ text: 'pickNone 开始' })
      aiSpaceStore.selectSpace(null)
      close()
    }

    const pickSpace = (id: string) => {
    logger.info({ text: 'pickSpace 开始' })
      aiSpaceStore.selectSpace(id)
      close()
    }

    const createSpace = () => {
    logger.info({ text: 'createSpace 开始' })
      close()
      aiGlobalStore.setVisible('createSpace', true)
    }

    const openLocalFolder = async () => {
    logger.info({ text: 'openLocalFolder 开始' })
      close()
      try {
        await aiSpaceStore.openLocalFolder()
      }
      catch (error: any) {
        window.alert(error?.message || '打开本地文件夹失败')
      }
    }

    const onDocPointerDown = (event: MouseEvent) => {
    logger.info({ text: 'onDocPointerDown 开始' })
      if (!open.value || !rootRef.value)
        return
      if (!rootRef.value.contains(event.target as Node))
        close()
    }

    onMounted(() => {
      document.addEventListener('mousedown', onDocPointerDown)
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onDocPointerDown)
    })

    return {
      aiSpaceStore,
      open,
      keyword,
      rootRef,
      searchRef,
      currentLabel,
      filteredSpaces,
      toggle,
      pickNone,
      pickSpace,
      createSpace,
      openLocalFolder,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-space-picker {
  position: relative;

  &__trigger {
    height: 28px;
    max-width: 200px;
    padding: 0 8px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 6px;

    img {
      width: 14px;
      height: 14px;
      opacity: 0.55;
      flex-shrink: 0;
    }

    &:hover,
    &.open {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &__label {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__chevron {
    width: 0;
    height: 0;
    margin-left: 2px;
    border-left: 3.5px solid transparent;
    border-right: 3.5px solid transparent;
    border-top: 4px solid #B2BEC3;
    flex-shrink: 0;
  }

  &__panel {
    position: absolute;
    left: 0;
    bottom: calc(100% + 6px);
    width: 280px;
    background: #FFFFFF;
    border: 1px solid #EBEEF5;
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    z-index: 40;
    overflow: hidden;
  }

  &__search {
    display: flex;
    align-items: center;
    gap: 8px;
    margin: 10px 10px 6px;
    padding: 0 10px;
    height: 34px;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    background: #F9FAFB;

    img {
      width: 14px;
      height: 14px;
      opacity: 0.45;
      flex-shrink: 0;
    }

    input {
      flex: 1;
      min-width: 0;
      border: none;
      outline: none;
      background: transparent;
      font-size: 12px;
      color: #2D3436;
      font-family: inherit;

      &::placeholder {
        color: #B2BEC3;
      }
    }
  }

  &__list {
    max-height: 220px;
    overflow-y: auto;
    padding: 4px 6px 8px;
  }

  &__item {
    width: 100%;
    min-height: 34px;
    padding: 6px 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    text-align: left;
    box-sizing: border-box;

    img {
      width: 14px;
      height: 14px;
      opacity: 0.5;
      flex-shrink: 0;
    }

    &:hover {
      background: #F9FAFB;
    }

    &.active {
      background: #FFE6D9;
      color: #E86835;

      .ai-space-picker__item-hint {
        color: #E86835;
        opacity: 0.75;
      }
    }
  }

  &__item-name {
    flex: 1;
    min-width: 0;
    font-size: 12px;
    color: #2D3436;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item.active &__item-name {
    color: #E86835;
  }

  &__item-hint {
    font-size: 11px;
    color: #B2BEC3;
    flex-shrink: 0;
  }

  &__empty {
    padding: 16px 10px;
    text-align: center;
    font-size: 12px;
    color: #B2BEC3;
  }

  &__footer {
    border-top: 1px solid #EBEEF5;
    padding: 6px;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__divider {
    height: 1px;
    margin: 4px 4px;
    background: #EBEEF5;
  }

  &__action {
    width: 100%;
    height: 34px;
    padding: 0 10px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;

    img {
      width: 14px;
      height: 14px;
      opacity: 0.5;
    }

    &:hover {
      background: #F9FAFB;
      color: #2D3436;
    }

    &.active {
      background: #FFE6D9;
      color: #E86835;
    }
  }
}
</style>
