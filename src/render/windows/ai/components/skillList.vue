<template>
  <div class="ai-skill-list">
    <div v-if="skills.length === 0" class="ai-skill-list__empty">
      <img src="renderModule/assets/image/assistant/skill.svg" alt="skill">
      <p>还没有安装技能，去技能广场看看吧</p>
    </div>

    <div
      v-for="skill in skills"
      :key="skill.id"
      class="ai-skill-list__card"
    >
      <div class="ai-skill-list__card-head">
        <div class="ai-skill-list__name">
          {{ skill.name }}
        </div>
        <span class="ai-skill-list__tag" :class="{ highlight: skill.tag === '高级' }">
          {{ skill.tag }}
        </span>
      </div>
      <div class="ai-skill-list__desc">
        {{ skill.desc }}
      </div>
      <div class="ai-skill-list__actions">
        <button
          v-if="mode === 'plaza' && !skill.installed"
          class="ai-skill-list__btn ai-skill-list__btn--primary"
          type="button"
          @click="$emit('install', skill.id)"
        >
          安装
        </button>
        <button
          v-if="mode === 'plaza' && skill.installed"
          class="ai-skill-list__btn ai-skill-list__btn--ghost"
          type="button"
          @click="$emit('use', skill.id)"
        >
          使用
        </button>
        <template v-if="mode === 'mine'">
          <button
            class="ai-skill-list__btn ai-skill-list__btn--primary"
            type="button"
            @click="$emit('use', skill.id)"
          >
            使用
          </button>
          <button
            v-if="skill.id !== 'general'"
            class="ai-skill-list__btn ai-skill-list__btn--ghost"
            type="button"
            @click="$emit('uninstall', skill.id)"
          >
            移除
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import type { IAiSkill } from 'renderModule/windows/ai/types/skill'

export default defineComponent({
  name: 'AiSkillList',
  props: {
    skills: {
      type: Array as () => IAiSkill[],
      required: true,
    },
    mode: {
      type: String as () => 'plaza' | 'mine',
      required: true,
    },
  },
  emits: ['install', 'uninstall', 'use'],
})
</script>

<style lang="less" scoped>
.ai-skill-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;

  &__empty {
    grid-column: 1 / -1;
    padding: 48px 16px;
    text-align: center;
    color: #636E72;

    img {
      width: 40px;
      height: 40px;
      margin-bottom: 12px;
      opacity: 0.7;
    }

    p {
      margin: 0;
      font-size: 14px;
    }
  }

  &__card {
    padding: 16px;
    background: #FFFFFF;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
    transition: box-shadow 0.2s, border-color 0.2s;

    &:hover {
      border-color: rgba(255, 125, 69, 0.35);
      box-shadow: 0 4px 16px rgba(255, 125, 69, 0.12);
    }
  }

  &__card-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-bottom: 8px;
  }

  &__name {
    font-size: 15px;
    font-weight: 600;
    color: #2D3436;
  }

  &__tag {
    flex-shrink: 0;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 11px;
    color: #4A6FA1;
    background: #D9E6FF;

    &.highlight {
      color: #E86835;
      background: #FFE6D9;
    }
  }

  &__desc {
    font-size: 13px;
    line-height: 1.5;
    color: #636E72;
    min-height: 40px;
    margin-bottom: 16px;
  }

  &__actions {
    display: flex;
    gap: 8px;
  }

  &__btn {
    height: 32px;
    padding: 0 14px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &--primary {
      border: none;
      color: #FFFFFF;
      background: linear-gradient(135deg, #FF7D45 0%, #E86835 100%);
    }

    &--ghost {
      border: 1px solid #EBEEF5;
      color: #636E72;
      background: #FFFFFF;

      &:hover {
        border-color: #FF7D45;
        color: #FF7D45;
      }
    }
  }
}
</style>
