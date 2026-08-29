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
  <BeaverDialog
    v-model="aiModelStore.settingsVisible"
    title="AI 设置"
    width="880px"
  >
    <div class="ai-model-settings">
      <aside class="ai-model-settings__nav">
        <button
          v-for="item in sections"
          :key="item.key"
          class="ai-model-settings__nav-item"
          :class="{ active: aiModelStore.activeSection === item.key }"
          type="button"
          @click="aiModelStore.openSettings(item.key)"
        >
          <span class="ai-model-settings__nav-mark">{{ item.mark }}</span>
          <span>{{ item.label }}</span>
        </button>
        <div class="ai-model-settings__nav-hint">
          后续逐步开放：智能体 / 个性化 / 记忆 …
        </div>
      </aside>

      <section class="ai-model-settings__main">
        <div class="ai-model-settings__form">
          <h4 class="ai-model-settings__title">
            添加模型
          </h4>
          <div class="ai-model-settings__row">
            <label class="ai-model-settings__field">
              <span>名称</span>
              <input
                v-model="form.name"
                type="text"
                placeholder="如 GPT-4o"
                maxlength="64"
              >
            </label>
            <label class="ai-model-settings__field">
              <span>服务商</span>
              <select v-model="form.provider">
                <option value="openai">
                  OpenAI
                </option>
                <option value="anthropic">
                  Anthropic
                </option>
                <option value="deepseek">
                  DeepSeek
                </option>
                <option value="ollama">
                  Ollama
                </option>
                <option value="custom">
                  自定义
                </option>
              </select>
            </label>
          </div>
          <label class="ai-model-settings__field">
            <span>API Key</span>
            <input
              v-model="form.apiKey"
              type="password"
              placeholder="sk-..."
            >
          </label>
          <label class="ai-model-settings__field">
            <span>接口地址（可选，留空走默认）</span>
            <input
              v-model="form.endpoint"
              type="text"
              placeholder="https://api.example.com/v1"
            >
          </label>
          <div class="ai-model-settings__form-actions">
            <BeaverButton
              type="primary"
              :disabled="!canAdd"
              @click="handleAdd"
            >
              添加
            </BeaverButton>
          </div>
        </div>

        <div class="ai-model-settings__list">
          <h4 class="ai-model-settings__title">
            已添加模型（{{ aiModelStore.models.length }}）
          </h4>
          <div
            v-for="m in aiModelStore.models"
            :key="m.id"
            class="ai-model-settings__model"
          >
            <div class="ai-model-settings__model-info">
              <span class="ai-model-settings__model-name">{{ m.name }}</span>
              <span class="ai-model-settings__model-provider">{{ providerLabel(m.provider) }}</span>
            </div>
            <button
              class="ai-model-settings__remove"
              type="button"
              title="移除"
              @click="aiModelStore.removeModel(m.id)"
            >
              删除
            </button>
          </div>
          <div v-if="aiModelStore.models.length === 0" class="ai-model-settings__empty">
            还没有添加模型
          </div>
        </div>
      </section>
    </div>
  </BeaverDialog>
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from 'vue'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import { useAiModelStore } from 'renderModule/windows/ai/pinia/model'
import type { AiSettingsSection } from 'renderModule/windows/ai/types/model'

/**
 * AI 设置弹窗：左侧分类导航（先只「模型」）+ 右侧模型管理（添加表单 + 列表）。
 * 内容较多但走 dialog，不新开 render 进程、不与 IM 设置混。
 */
export default defineComponent({
  name: 'AiModelSettings',
  components: { BeaverDialog, BeaverButton },
  setup() {
    const aiModelStore = useAiModelStore()

    const sections: Array<{ key: AiSettingsSection, label: string, mark: string }> = [
      { key: 'model', label: '模型', mark: 'M' },
    ]

    const form = reactive({
      name: '',
      provider: 'openai',
      apiKey: '',
      endpoint: '',
    })

    const canAdd = computed(() => form.name.trim() !== '' && form.apiKey.trim() !== '')

    const providerLabel = (provider: string) => {
      const map: Record<string, string> = {
        openai: 'OpenAI',
        anthropic: 'Anthropic',
        deepseek: 'DeepSeek',
        ollama: 'Ollama',
        custom: '自定义',
      }
      return map[provider] || provider
    }

    const resetForm = () => {
      form.name = ''
      form.provider = 'openai'
      form.apiKey = ''
      form.endpoint = ''
    }

    const handleAdd = () => {
      if (!canAdd.value)
        return
      aiModelStore.addModel({
        name: form.name.trim(),
        provider: form.provider,
        apiKey: form.apiKey.trim(),
        endpoint: form.endpoint.trim(),
      })
      resetForm()
    }

    return {
      aiModelStore,
      sections,
      form,
      canAdd,
      providerLabel,
      handleAdd,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-model-settings {
  display: flex;
  gap: 24px;
  min-height: 420px;

  &__nav {
    width: 160px;
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px 0;
    border-right: 1px solid #EBEEF5;
  }

  &__nav-item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 36px;
    padding: 0 12px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #636E72;
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: background 150ms ease;

    &:hover {
      background: #F9FAFB;
    }

    &.active {
      background: rgba(255, 125, 69, 0.1);
      color: #FF7D45;
      font-weight: 500;
    }
  }

  &__nav-mark {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 10px;
    font-weight: 600;
    border-radius: 4px;
    background: #EBEEF5;
    color: #636E72;
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  }

  &__nav-hint {
    margin-top: 12px;
    padding: 8px 12px;
    font-size: 11px;
    line-height: 1.5;
    color: #B2BEC3;
  }

  &__main {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }

  &__title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #2D3436;
  }

  &__row {
    display: flex;
    gap: 16px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    flex: 1;
    min-width: 0;
    margin-bottom: 12px;
    font-size: 12px;
    color: #636E72;

    input,
    select {
      height: 36px;
      padding: 0 12px;
      border: 1px solid #EBEEF5;
      border-radius: 8px;
      outline: none;
      font-size: 13px;
      color: #2D3436;
      background: #FFFFFF;
      box-sizing: border-box;
      font-family: inherit;
      transition: border-color 0.2s;

      &::placeholder {
        color: #B2BEC3;
      }

      &:focus {
        border-color: #FF7D45;
      }
    }

    select {
      cursor: pointer;
    }
  }

  &__form-actions {
    margin-top: 4px;
  }

  &__list {
    border-top: 1px solid #EBEEF5;
    padding-top: 20px;
  }

  &__model {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    height: 44px;
    padding: 0 12px;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  &__model-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__model-name {
    font-size: 13px;
    font-weight: 500;
    color: #2D3436;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__model-provider {
    flex-shrink: 0;
    font-size: 11px;
    color: #4A6FA1;
    background: #D9E6FF;
    padding: 1px 6px;
    border-radius: 4px;
  }

  &__remove {
    flex-shrink: 0;
    height: 26px;
    padding: 0 10px;
    border: 1px solid #EBEEF5;
    border-radius: 6px;
    background: #FFFFFF;
    color: #636E72;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      border-color: #FF5252;
      color: #FF5252;
    }
  }

  &__empty {
    padding: 24px 12px;
    text-align: center;
    font-size: 12px;
    color: #B2BEC3;
  }
}
</style>
