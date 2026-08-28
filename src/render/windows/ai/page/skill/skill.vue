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
  <div class="ai-skill-page">
    <div class="ai-skill-page__header">
      <h2 class="ai-skill-page__title">
        专家·技能·连接器
      </h2>
    </div>

    <div class="ai-skill-page__tabs">
      <button
        class="ai-skill-page__tab"
        :class="{ active: aiViewStore.skillTab === 'plaza' }"
        type="button"
        @click="aiViewStore.setSkillTab('plaza')"
      >
        技能广场
      </button>
      <button
        class="ai-skill-page__tab"
        :class="{ active: aiViewStore.skillTab === 'mine' }"
        type="button"
        @click="aiViewStore.setSkillTab('mine')"
      >
        我的技能
      </button>
    </div>

    <div class="ai-skill-page__body">
      <AiSkillList
        v-if="aiViewStore.skillTab === 'plaza'"
        :skills="aiSkillStore.plazaSkills"
        mode="plaza"
        @install="aiSkillStore.installSkill"
        @use="handleUse"
      />
      <AiSkillList
        v-else
        :skills="aiSkillStore.mySkills"
        mode="mine"
        @uninstall="aiSkillStore.uninstallSkill"
        @use="handleUse"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { useAiChatStore } from 'renderModule/windows/ai/pinia/chat'
import { useAiSkillStore } from 'renderModule/windows/ai/pinia/skill'
import { useAiViewStore } from 'renderModule/windows/ai/pinia/view'
import AiSkillList from './components/skillList.vue'

export default defineComponent({
  name: 'AiSkillPage',
  components: { AiSkillList },
  setup() {
    const router = useRouter()
    const aiViewStore = useAiViewStore()
    const aiSkillStore = useAiSkillStore()
    const aiChatStore = useAiChatStore()

    const handleUse = (skillId: string) => {
      aiSkillStore.selectSkill(skillId)
      aiChatStore.startNewTask(skillId)
      aiViewStore.bumpComposeEpoch()
      router.push({ name: 'newTask' })
    }

    return {
      aiViewStore,
      aiSkillStore,
      handleUse,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-skill-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #F9FAFB;

  &__header {
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    background: #FFFFFF;
    border-bottom: 1px solid #EBEEF5;
    flex-shrink: 0;
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }

  &__tabs {
    height: 40px;
    display: flex;
    padding: 0 24px;
    background: #FFFFFF;
    border-bottom: 1px solid #EBEEF5;
    flex-shrink: 0;
  }

  &__tab {
    position: relative;
    height: 40px;
    padding: 0 16px;
    border: none;
    background: transparent;
    color: #636E72;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;

    &.active {
      color: #2D3436;

      &::after {
        content: '';
        position: absolute;
        left: 16px;
        right: 16px;
        bottom: 0;
        height: 2px;
        background: #FF7D45;
      }
    }
  }

  &__body {
    flex: 1;
    overflow: auto;
    padding: 16px 24px 24px;
  }
}
</style>
