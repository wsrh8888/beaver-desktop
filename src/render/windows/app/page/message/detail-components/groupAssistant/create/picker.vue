<template>
  <div class="group-assistant-picker">
    <div class="group-assistant-picker__types">
      <div
        v-for="typeItem in botTypeOptions"
        :key="typeItem.key"
        class="group-assistant-picker__type"
        :class="{ 'group-assistant-picker__type--active': selectedBotType === typeItem.key }"
        @click="selectBotType(typeItem.key)"
      >
        {{ typeItem.label }}
      </div>
    </div>

    <div class="group-assistant-picker__grid">
      <div
        v-for="tpl in botTemplateOptions"
        :key="tpl.key"
        class="group-assistant-picker__card"
        @click="selectTemplate(tpl.key)"
      >
        <div class="group-assistant-picker__card-avatar">
          <img :src="tpl.avatar" alt="">
        </div>
        <div class="group-assistant-picker__card-meta">
          <div class="group-assistant-picker__card-name">
            {{ tpl.name }}
          </div>
          <div class="group-assistant-picker__card-desc">
            {{ tpl.desc }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { GroupBotType } from '../config'
import { botTemplateOptions, botTypeOptions } from '../config'
import { defineComponent, ref } from 'vue'

export default defineComponent({
  name: 'groupAssistantPicker',
  emits: ['select'],
  setup(_, { emit }) {
    const selectedBotType = ref(botTypeOptions[0]?.key || 'notification')

    const selectBotType = (key: string) => {
      selectedBotType.value = key
    }

    const selectTemplate = (type: GroupBotType) => {
      emit('select', type)
    }

    return {
      botTypeOptions,
      botTemplateOptions,
      selectedBotType,
      selectBotType,
      selectTemplate,
    }
  },
})
</script>

<style lang="less" scoped>
.group-assistant-picker {
  .group-assistant-picker__types {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 16px;
  }

  .group-assistant-picker__type {
    padding: 6px 14px;
    border-radius: 16px;
    font-size: 13px;
    color: #636e72;
    background: #f9fafb;
    border: 1px solid #ebeef5;
    cursor: pointer;
  }

  .group-assistant-picker__type--active {
    color: #ff7d45;
    background: #fff8f5;
    border-color: #ffe6d9;
  }

  .group-assistant-picker__grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .group-assistant-picker__card {
    display: flex;
    align-items: flex-start;
    padding: 12px;
    border: 1px solid #ebeef5;
    border-radius: 8px;
    cursor: pointer;
    transition: border-color 0.2s;

    &:hover {
      border-color: #ff7d45;
    }
  }

  .group-assistant-picker__card-avatar {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    background: #ffe6d9;
    color: #ff7d45;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    flex-shrink: 0;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .group-assistant-picker__card-meta {
    flex: 1;
    margin-left: 10px;
    min-width: 0;
  }

  .group-assistant-picker__card-name {
    font-size: 14px;
    font-weight: 600;
    color: #2d3436;
    line-height: 1.3;
  }

  .group-assistant-picker__card-desc {
    font-size: 12px;
    color: #b2bec3;
    margin-top: 4px;
    line-height: 1.4;
  }
}
</style>
