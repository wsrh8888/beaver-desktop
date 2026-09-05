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
  <div ref="rootRef" class="ai-model-picker">
    <button
      class="ai-model-picker__trigger"
      type="button"
      :class="{ open: open }"
      @click="toggle"
    >
      <img src="renderModule/assets/image/ai/robot.svg" alt="model">
      <span class="ai-model-picker__label">{{ currentLabel }}</span>
      <span class="ai-model-picker__chevron" />
    </button>

    <div v-if="open" class="ai-model-picker__panel" @click.stop>
      <template v-if="aiModelStore.officialModels.length > 0">
        <button
          v-for="m in aiModelStore.officialModels"
          :key="`official-${m.id}`"
          class="ai-model-picker__item"
          type="button"
          @click="pick('official', m.id)"
        >
          <span class="ai-model-picker__item-name">{{ m.name }}</span>
          <span
            v-if="m.id !== autoModelId && officialHint(m)"
            class="ai-model-picker__item-hint"
          >{{ officialHint(m) }}</span>
          <img
            v-if="isSelected('official', m.id)"
            class="ai-model-picker__check"
            src="renderModule/assets/image/ai/check.svg"
            alt=""
          >
        </button>
      </template>

      <template v-if="aiModelStore.customModels.length > 0">
        <div class="ai-model-picker__group">
          我的模型
        </div>
        <button
          v-for="m in aiModelStore.customModels"
          :key="`custom-${m.id}`"
          class="ai-model-picker__item"
          type="button"
          @click="pick('custom', m.id)"
        >
          <span class="ai-model-picker__item-name">{{ m.name }}</span>
          <span class="ai-model-picker__item-hint">{{ endpointHint(m.endpoint) }}</span>
          <img
            v-if="isSelected('custom', m.id)"
            class="ai-model-picker__check"
            src="renderModule/assets/image/ai/check.svg"
            alt=""
          >
        </button>
      </template>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onBeforeUnmount, onMounted, ref } from 'vue'
import { listAgentModelsApi, listOfficialModelsApi } from 'renderModule/api/agent'
import Logger from 'renderModule/utils/logger'
import { useAiModelStore } from 'renderModule/windows/ai/pinia/model'

const logger = new Logger('AiModelPicker')
import type { AiModelSource, IAiCustomModel, IAiOfficialModel } from 'renderModule/windows/ai/types/model'
import { AI_MODEL_AUTO_ID } from 'renderModule/windows/ai/types/model'

/** 输入框旁模型选择：官方（含 Auto）/ 我的 分组展示 */
export default defineComponent({
  name: 'AiModelPicker',
  setup() {
    const aiModelStore = useAiModelStore()
    const open = ref(false)
    const rootRef = ref<HTMLElement | null>(null)
    const autoModelId = AI_MODEL_AUTO_ID

    const currentLabel = computed(() => {
      return aiModelStore.selectedModel?.name || 'Auto'
    })

    const endpointHint = (endpoint: string) => {
      try {
        const host = new URL(endpoint).host
        return host || endpoint
      }
      catch {
        return endpoint || '自定义'
      }
    }

    const tierLabel = (tier: string) => {
      if (tier === 'fast')
        return '快速'
      if (tier === 'strong')
        return '强推理'
      return '均衡'
    }

    const officialHint = (m: IAiOfficialModel) => {
      if (m.id === AI_MODEL_AUTO_ID)
        return ''
      const parts = [m.provider || '官方', tierLabel(m.tier)]
      return parts.filter(Boolean).join(' · ')
    }

    const isSelected = (source: AiModelSource, id: string) => {
      return aiModelStore.selected?.source === source && aiModelStore.selected.id === id
    }

    const toggle = () => {
      open.value = !open.value
    }

    const pick = (source: AiModelSource, id: string) => {
      aiModelStore.selectModel(source, id)
      open.value = false
    }

    const loadLists = async () => {
      try {
        const [officialRes, customRes] = await Promise.all([
          listOfficialModelsApi(),
          listAgentModelsApi(),
        ])
        if (officialRes.code === 0) {
          const list: IAiOfficialModel[] = (officialRes.result.list || []).map(item => ({
            id: item.modelId,
            name: item.name,
            provider: item.provider,
            modelName: item.modelName,
            endpoint: item.endpoint,
            tier: item.tier || 'balanced',
            capabilities: {
              vision: !!item.capabilities?.vision,
              tools: !!item.capabilities?.tools,
              reasoning: !!item.capabilities?.reasoning,
              structuredOutput: !!item.capabilities?.structuredOutput,
              longContext: !!item.capabilities?.longContext,
            },
            sort: item.sort,
          }))
          aiModelStore.setOfficialModels(list)
        }
        if (customRes.code === 0) {
          const list: IAiCustomModel[] = (customRes.result.list || []).map(item => ({
            id: item.modelId,
            name: item.name,
            endpoint: item.endpoint,
            apiKey: '',
            tier: item.tier || 'balanced',
            capabilities: {
              vision: !!item.capabilities?.vision,
              tools: !!item.capabilities?.tools,
              reasoning: !!item.capabilities?.reasoning,
              structuredOutput: !!item.capabilities?.structuredOutput,
              longContext: !!item.capabilities?.longContext,
            },
          }))
          aiModelStore.setCustomModels(list)
        }
      }
      catch (err) {
        logger.error({ text: '加载模型列表失败', data: { error: (err as Error)?.message } })
      }
    }

    const onDocPointerDown = (event: MouseEvent) => {
      if (!open.value || !rootRef.value)
        return
      if (!rootRef.value.contains(event.target as Node))
        open.value = false
    }

    onMounted(() => {
      document.addEventListener('mousedown', onDocPointerDown)
      void loadLists()
    })

    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', onDocPointerDown)
    })

    return {
      aiModelStore,
      open,
      rootRef,
      autoModelId,
      currentLabel,
      endpointHint,
      officialHint,
      isSelected,
      toggle,
      pick,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-model-picker {
  position: relative;

  &__trigger {
    height: 32px;
    max-width: 160px;
    padding: 0 12px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    background: #FFFFFF;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;

    img {
      width: 14px;
      height: 14px;
      flex-shrink: 0;
    }

    &:hover,
    &.open {
      background: #F9FAFB;
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
    right: 0;
    bottom: calc(100% + 6px);
    width: 220px;
    max-height: 280px;
    overflow-y: auto;
    background: #FFFFFF;
    border: 1px solid #EBEEF5;
    border-radius: 10px;
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
    z-index: 40;
    padding: 6px;
  }

  &__group {
    padding: 8px 10px 4px;
    font-size: 11px;
    color: #B2BEC3;
  }

  &__item {
    width: 100%;
    min-height: 36px;
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

    &:hover {
      background: #F9FAFB;
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

  &__item-hint {
    flex-shrink: 0;
    font-size: 10px;
    color: #636E72;
  }

  &__check {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
    color: #E86835;
  }

  &__empty {
    padding: 16px 10px;
    text-align: center;
    font-size: 12px;
    color: #B2BEC3;
  }
}
</style>
