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
  <aside class="ai-sidebar">
    <div class="ai-sidebar__brand">
      <div>
        <div class="ai-sidebar__name">
          海狸助手
        </div>
        <div class="ai-sidebar__ver">
          v{{ version }}
        </div>
      </div>
      <div class="ai-sidebar__brand-actions">
        <button class="ai-sidebar__icon-btn" type="button" title="收起侧栏" @click="aiViewStore.toggleSidebar()">
          <img src="renderModule/assets/image/group/expand.svg" alt="toggle">
        </button>
        <button class="ai-sidebar__icon-btn" type="button" title="搜索">
          <img src="renderModule/assets/image/friend/search.svg" alt="search">
        </button>
      </div>
    </div>

    <button class="ai-sidebar__new" type="button" @click="handleNewTask">
      <img src="renderModule/assets/image/common/add.svg" alt="add">
      新建任务
    </button>

    <nav class="ai-sidebar__nav">
      <button
        v-for="item in aiNavList"
        :key="item.id"
        class="ai-sidebar__nav-item"
        :class="{ active: isNavActive(item) }"
        type="button"
        @click="router.push(item.route)"
      >
        <img :src="item.icon" :alt="item.title" class="ai-sidebar__nav-icon">
        <span class="ai-sidebar__nav-title">{{ item.title }}</span>
        <span v-if="item.tags?.length" class="ai-sidebar__tags">
          <span v-for="tag in item.tags" :key="tag" class="ai-sidebar__tag">{{ tag }}</span>
        </span>
      </button>
    </nav>

    <div class="ai-sidebar__lists">
      <div class="ai-sidebar__section">
        <div class="ai-sidebar__section-head" @click="tasksOpen = !tasksOpen">
          <span>会话</span>
          <img
            src="renderModule/assets/image/group/expand.svg"
            alt="expand"
            class="ai-sidebar__arrow"
            :class="{ open: tasksOpen }"
          >
        </div>
        <div v-show="tasksOpen" class="ai-sidebar__section-body">
          <div
            v-for="chat in aiChatStore.cloudChats"
            :key="chat.id"
            class="ai-sidebar__item"
            :class="{ active: isChatActive(chat.id) }"
            @click="handleSelectChat(chat.id)"
          >
            <span class="ai-sidebar__item-title">{{ chat.title }}</span>
            <span class="ai-sidebar__item-time">{{ formatRelative(chat.timestamp) }}</span>
          </div>
          <div v-if="aiChatStore.cloudChats.length === 0" class="ai-sidebar__empty">
            暂无云端会话
          </div>
        </div>
      </div>

      <div class="ai-sidebar__section">
        <div class="ai-sidebar__section-head">
          <button class="ai-sidebar__section-toggle" type="button" @click="spacesOpen = !spacesOpen">
            <span>空间 ({{ aiSpaceStore.localSpaces.length }})</span>
            <img
              src="renderModule/assets/image/group/expand.svg"
              alt="expand"
              class="ai-sidebar__arrow"
              :class="{ open: spacesOpen }"
            >
          </button>
        </div>

        <div v-show="spacesOpen" class="ai-sidebar__section-body">
          <div
            v-for="space in aiSpaceStore.localSpaces"
            :key="space.id"
            class="ai-sidebar__space-block"
          >
            <div class="ai-sidebar__space">
              <img src="renderModule/assets/image/moment/file.svg" alt="folder">
              <span>{{ space.name }}</span>
            </div>
            <div
              v-for="session in sessionsOfSpace(space.id)"
              :key="session.id"
              class="ai-sidebar__item ai-sidebar__item--session"
              :class="{ active: isChatActive(session.id) }"
              @click="handleSelectChat(session.id)"
            >
              <span class="ai-sidebar__item-title">{{ session.title }}</span>
              <span class="ai-sidebar__item-time">{{ formatRelative(session.timestamp) }}</span>
            </div>
          </div>
          <div v-if="aiSpaceStore.localSpaces.length === 0" class="ai-sidebar__empty">
            暂无本机空间
          </div>
        </div>
      </div>
    </div>

    <button
      class="ai-sidebar__settings"
      type="button"
      @click="aiGlobalStore.setVisible('settings', true)"
    >
      <img src="renderModule/assets/image/leftBar/settings/settings.svg" alt="settings">
      设置
    </button>
  </aside>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { aiNavList, type IAiNavItem } from 'renderModule/windows/ai/components/layout/sidebar/data'
import { useAiChatStore } from 'renderModule/windows/ai/pinia/chat'
import { useAiGlobalStore } from 'renderModule/windows/ai/pinia/global'
import { useAiSkillStore } from 'renderModule/windows/ai/pinia/skill'
import { useAiSpaceStore } from 'renderModule/windows/ai/pinia/space'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'

export default defineComponent({
  name: 'AiSidebar',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const aiChatStore = useAiChatStore()
    const aiSkillStore = useAiSkillStore()
    const aiSpaceStore = useAiSpaceStore()
    const aiViewStore = useAiViewStore()
    const aiGlobalStore = useAiGlobalStore()
    const tasksOpen = ref(true)
    const spacesOpen = ref(true)
    const version = '2.1.2'

    const formatRelative = (timestamp: number) => {
      const diff = Date.now() - timestamp
      const day = 24 * 60 * 60 * 1000
      if (diff < day)
        return '今天'
      const days = Math.floor(diff / day)
      if (days < 30)
        return `${days}天前`
      return `${Math.floor(days / 30)}月前`
    }

    const sessionsOfSpace = (spaceId: string) => {
      return aiChatStore.sessionsBySpace[spaceId] || []
    }

    const isNavActive = (item: IAiNavItem) => route.path === item.route

    const isChatActive = (id: string) => {
      return route.name === 'chat' && String(route.params.id) === id
    }

    const handleNewTask = () => {
      aiChatStore.startNewChat(aiSkillStore.activeSkillId)
      aiViewStore.bumpComposeEpoch()
      if (route.name === 'newTask')
        return
      router.push({ name: 'newTask' })
    }

    const handleSelectChat = (id: string) => {
      aiChatStore.openChat(id)
      router.push({ name: 'chat', params: { id } })
    }

    return {
      router,
      aiChatStore,
      aiSpaceStore,
      aiViewStore,
      aiGlobalStore,
      aiNavList,
      tasksOpen,
      spacesOpen,
      version,
      formatRelative,
      sessionsOfSpace,
      isNavActive,
      isChatActive,
      handleNewTask,
      handleSelectChat,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-sidebar {
  width: 280px;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #FFFFFF;
  border-right: 1px solid #EBEEF5;
  padding: 8px;
  box-sizing: border-box;

  &__brand {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 8px;
  }

  &__name {
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
    line-height: 1.3;
  }

  &__ver {
    margin-top: 2px;
    font-size: 12px;
    color: #B2BEC3;
  }

  &__brand-actions {
    display: flex;
    gap: 2px;
  }

  &__icon-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 14px;
      height: 14px;
      opacity: 0.55;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }

  &__new {
    width: 100%;
    height: 36px;
    margin: 8px 0;
    border: none;
    border-radius: 6px;
    background: #F9FAFB;
    color: #2D3436;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 0 16px;
    transition: background 200ms cubic-bezier(0.33, 1, 0.68, 1);

    img {
      width: 16px;
      height: 16px;
    }

    &:hover {
      background: #FFE6D9;
      color: #FF7D45;
    }
  }

  &__nav {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  &__nav-item {
    min-height: 40px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #2D3436;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    text-align: left;
    position: relative;
    transition: background 200ms cubic-bezier(0.33, 1, 0.68, 1);

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    &.active {
      background: rgba(255, 125, 69, 0.1);
      color: #FF7D45;

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 8px;
        bottom: 8px;
        width: 3px;
        border-radius: 0 2px 2px 0;
        background: #FF7D45;
      }
    }
  }

  &__nav-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  &__nav-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__tags {
    display: flex;
    gap: 4px;
  }

  &__tag {
    font-size: 10px;
    color: #B2BEC3;
    background: #F9FAFB;
    border-radius: 4px;
    padding: 1px 4px;
  }

  &__lists {
    flex: 1;
    min-height: 0;
    display: flex;
    flex-direction: column;
    margin-top: 8px;
    overflow: hidden;
  }

  &__section {
    display: flex;
    flex-direction: column;
    min-height: 0;

    & + & {
      margin-top: 8px;
      flex: 1;
    }
  }

  &__section-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 4px 4px 12px;
    font-size: 12px;
    color: #636E72;
    user-select: none;
    cursor: pointer;
  }

  &__section-toggle {
    flex: 1;
    border: none;
    background: transparent;
    color: inherit;
    font-size: inherit;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;
  }

  &__arrow {
    width: 12px;
    height: 12px;
    opacity: 0.5;
    transform: rotate(-90deg);
    transition: transform 200ms cubic-bezier(0.33, 1, 0.68, 1);

    &.open {
      transform: rotate(0deg);
    }
  }

  &__section-body {
    overflow-y: auto;
  }

  &__empty {
    padding: 8px 12px;
    font-size: 12px;
    color: #B2BEC3;
  }

  &__space-block {
    margin-bottom: 4px;
  }

  &__space {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px;
    font-size: 13px;
    color: #2D3436;
    border-radius: 6px;

    img {
      width: 14px;
      height: 14px;
      opacity: 0.55;
    }
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    min-height: 40px;
    padding: 0 12px;
    border-radius: 6px;
    cursor: pointer;
    transition: background 200ms cubic-bezier(0.33, 1, 0.68, 1);

    &--session {
      padding-left: 32px;
    }

    &:hover {
      background: #F9FAFB;
    }

    &.active {
      background: rgba(255, 125, 69, 0.1);
    }
  }

  &__item-title {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    color: #2D3436;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-time {
    flex-shrink: 0;
    font-size: 11px;
    color: #B2BEC3;
  }

  &__settings {
    flex-shrink: 0;
    width: 100%;
    height: 40px;
    margin-top: 8px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #2D3436;
    font-size: 13px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 0 12px;
    transition: background 200ms cubic-bezier(0.33, 1, 0.68, 1);

    img {
      width: 16px;
      height: 16px;
      opacity: 0.55;
    }

    &:hover {
      background: rgba(0, 0, 0, 0.05);
    }
  }
}
</style>
