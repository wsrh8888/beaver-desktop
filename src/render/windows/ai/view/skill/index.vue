<template>
  <div class="ai-skill-view">
    <div class="ai-skill-view__header">
      <button class="ai-skill-view__back" type="button" @click="aiViewStore.closeSkillStore()">
        <img src="renderModule/assets/image/common/back.svg" alt="返回">
        <span>返回对话</span>
      </button>
      <h2 class="ai-skill-view__title">
        技能商店
      </h2>
    </div>

    <div class="ai-skill-view__tabs">
      <button
        class="ai-skill-view__tab"
        :class="{ active: aiViewStore.skillTab === 'plaza' }"
        type="button"
        @click="aiViewStore.setSkillTab('plaza')"
      >
        技能广场
      </button>
      <button
        class="ai-skill-view__tab"
        :class="{ active: aiViewStore.skillTab === 'mine' }"
        type="button"
        @click="aiViewStore.setSkillTab('mine')"
      >
        我的技能
      </button>
    </div>

    <div class="ai-skill-view__body">
      <AiSkillList
        v-if="aiViewStore.skillTab === 'plaza'"
        :skills="aiSkillStore.plazaSkills"
        mode="plaza"
        @install="handleInstall"
        @use="handleUse"
      />
      <AiSkillList
        v-else
        :skills="aiSkillStore.mySkills"
        mode="mine"
        @uninstall="handleUninstall"
        @use="handleUse"
      />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiSkillList from 'renderModule/windows/ai/components/skillList.vue'
import { useAiChatStore } from 'renderModule/windows/ai/store/chat'
import { useAiSkillStore } from 'renderModule/windows/ai/store/skill'
import { useAiViewStore } from 'renderModule/windows/ai/store/view'

export default defineComponent({
  name: 'AiSkillView',
  components: { AiSkillList },
  setup() {
    const aiViewStore = useAiViewStore()
    const aiSkillStore = useAiSkillStore()
    const aiChatStore = useAiChatStore()

    const handleInstall = (skillId: string) => {
      aiSkillStore.installSkill(skillId)
    }

    const handleUninstall = (skillId: string) => {
      aiSkillStore.uninstallSkill(skillId)
    }

    const handleUse = (skillId: string) => {
      aiSkillStore.selectSkill(skillId)
      aiChatStore.startNewChat(skillId)
      aiViewStore.closeSkillStore()
    }

    return {
      aiViewStore,
      aiSkillStore,
      handleInstall,
      handleUninstall,
      handleUse,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-skill-view {
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #FFFFFF;

  &__header {
    height: 64px;
    padding: 0 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    border-bottom: 1px solid #EBEEF5;
    flex-shrink: 0;
  }

  &__back {
    display: flex;
    align-items: center;
    gap: 6px;
    border: none;
    background: transparent;
    color: #636E72;
    font-size: 13px;
    cursor: pointer;
    padding: 0;

    img {
      width: 16px;
      height: 16px;
    }

    &:hover {
      color: #FF7D45;
    }
  }

  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }

  &__tabs {
    display: flex;
    height: 40px;
    padding: 0 24px;
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
        border-radius: 2px 2px 0 0;
      }
    }
  }

  &__body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 24px 24px;
    background: #F9FAFB;
  }
}
</style>
