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
  <div class="ai-settings-model">
    <h3 class="ai-settings-model__heading">
      自定义模型
    </h3>

    <div class="ai-settings-model__card">
      <p class="ai-settings-model__desc">
        添加兼容 OpenAI 接口的自定义模型，用于本机对话与任务调用
      </p>
      <BeaverButton type="primary" @click="openAddDialog">
        添加模型
      </BeaverButton>
    </div>

    <div class="ai-settings-model__saved">
      <h4 class="ai-settings-model__saved-title">
        已保存模型
      </h4>

      <div
        v-for="m in aiModelStore.customModels"
        :key="m.id"
        class="ai-settings-model__item"
      >
        <div class="ai-settings-model__item-info">
          <span class="ai-settings-model__item-name">{{ m.name }}</span>
          <span
            v-if="m.capabilities.tools || m.capabilities.vision || m.capabilities.reasoning"
            class="ai-settings-model__item-tags"
          >
            <span v-if="m.capabilities.tools" class="ai-settings-model__tag">工具</span>
            <span v-if="m.capabilities.vision" class="ai-settings-model__tag">视觉</span>
            <span v-if="m.capabilities.reasoning" class="ai-settings-model__tag">推理</span>
            <span class="ai-settings-model__tag">{{ tierLabel(m.tier) }}</span>
          </span>
        </div>
        <button
          class="ai-settings-model__item-remove"
          type="button"
          title="删除"
          :disabled="removingId === m.id"
          @click="handleRemove(m.id)"
        >
          删除
        </button>
      </div>

      <div v-if="aiModelStore.customModels.length === 0" class="ai-settings-model__empty">
        暂无已保存的模型
      </div>
    </div>

    <BeaverDialog
      v-model="addVisible"
      title="添加模型"
      width="520px"
    >
      <div class="ai-settings-model__form">
        <label class="ai-settings-model__field">
          <span>接口地址</span>
          <BeaverInput
            v-model="form.endpoint"
            placeholder="https://api.example.com/v1"
          />
        </label>
        <label class="ai-settings-model__field">
          <span>API Key</span>
          <BeaverInput
            v-model="form.apiKey"
            type="password"
            show-password
            placeholder="sk-..."
          />
        </label>
        <label class="ai-settings-model__field">
          <span>模型名称</span>
          <BeaverInput
            v-model="form.name"
            placeholder="如 gpt-4o"
            :maxlength="64"
          />
        </label>

        <label class="ai-settings-model__field">
          <span>档位</span>
          <select v-model="form.tier" class="ai-settings-model__select">
            <option value="fast">
              快速
            </option>
            <option value="balanced">
              均衡
            </option>
            <option value="strong">
              强推理
            </option>
          </select>
        </label>

        <div class="ai-settings-model__caps">
          <div class="ai-settings-model__caps-title">
            能力画像
          </div>
          <div class="ai-settings-model__caps-body">
            <BeaverCheckbox v-model="form.capabilities.tools" label="工具调用" />
            <BeaverCheckbox v-model="form.capabilities.vision" label="视觉" />
            <BeaverCheckbox v-model="form.capabilities.reasoning" label="强推理" />
            <BeaverCheckbox v-model="form.capabilities.structuredOutput" label="结构化输出" />
            <BeaverCheckbox v-model="form.capabilities.longContext" label="长上下文" />
          </div>
        </div>
      </div>

      <template #footer>
        <BeaverButton type="default" @click="addVisible = false">
          取消
        </BeaverButton>
        <BeaverButton
          type="primary"
          style="margin-left: 8px"
          :disabled="!canAdd || saving"
          :loading="saving"
          @click="handleAdd"
        >
          确定
        </BeaverButton>
      </template>
    </BeaverDialog>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, reactive, ref } from 'vue'
import {
  createAgentModelApi,
  deleteAgentModelApi,
  listAgentModelsApi,
} from 'renderModule/api/agent'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverCheckbox from 'renderModule/components/ui/checkbox/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import BeaverInput from 'renderModule/components/ui/input/Input.vue'
import Message from 'renderModule/components/ui/message'
import { useAiModelStore } from 'renderModule/windows/ai/pinia/model'
import type { AiModelTier, IAiCustomModel, IAiModelCapabilities } from 'renderModule/windows/ai/types/model'

/**
 * 设置 · 模型页：
 * 标题「自定义模型」→ 描述 + 添加按钮 → 已保存列表；
 * 添加表单：接口地址 / API Key / 模型名称 + 档位 + 能力画像。
 */
export default defineComponent({
  name: 'AiSettingsModel',
  components: { BeaverButton, BeaverCheckbox, BeaverDialog, BeaverInput },
  setup() {
    const aiModelStore = useAiModelStore()
    const addVisible = ref(false)
    const saving = ref(false)
    const removingId = ref('')

    const defaultCapabilities = (): IAiModelCapabilities => ({
      vision: true,
      tools: true,
      reasoning: true,
      structuredOutput: false,
      longContext: false,
    })

    const form = reactive({
      endpoint: '',
      apiKey: '',
      name: '',
      tier: 'balanced' as AiModelTier,
      capabilities: defaultCapabilities(),
    })

    const canAdd = computed(() => {
      return form.endpoint.trim() !== ''
        && form.apiKey.trim() !== ''
        && form.name.trim() !== ''
    })

    const tierLabel = (tier: string) => {
      if (tier === 'fast')
        return '快速'
      if (tier === 'strong')
        return '强推理'
      return '均衡'
    }

    const mapCapabilities = (caps?: Partial<IAiModelCapabilities> | null): IAiModelCapabilities => ({
      vision: !!caps?.vision,
      tools: !!caps?.tools,
      reasoning: !!caps?.reasoning,
      structuredOutput: !!caps?.structuredOutput,
      longContext: !!caps?.longContext,
    })

    const resetForm = () => {
      form.endpoint = ''
      form.apiKey = ''
      form.name = ''
      form.tier = 'balanced'
      form.capabilities = defaultCapabilities()
    }

    const openAddDialog = () => {
      resetForm()
      addVisible.value = true
    }

    const loadModels = async () => {
      try {
        const res = await listAgentModelsApi()
        if (res.code !== 0)
          return
        const list: IAiCustomModel[] = (res.result.list || []).map(item => ({
          id: item.modelId,
          name: item.name,
          endpoint: item.endpoint,
          apiKey: '',
          tier: item.tier || 'balanced',
          capabilities: mapCapabilities(item.capabilities),
        }))
        aiModelStore.setCustomModels(list)
      }
      catch {
        // 列表失败时保持现状
      }
    }

    const handleAdd = async () => {
      if (!canAdd.value || saving.value)
        return
      saving.value = true
      try {
        const apiKey = form.apiKey.trim()
        const res = await createAgentModelApi({
          name: form.name.trim(),
          endpoint: form.endpoint.trim(),
          apiKey,
          tier: form.tier,
          capabilities: { ...form.capabilities },
        })
        if (res.code !== 0 || !res.result?.model) {
          Message.error('添加模型失败')
          return
        }
        const item = res.result.model
        aiModelStore.addCustomModel({
          id: item.modelId,
          name: item.name,
          endpoint: item.endpoint,
          apiKey,
          tier: item.tier || form.tier,
          capabilities: mapCapabilities(item.capabilities),
        })
        Message.success('添加成功')
        addVisible.value = false
        resetForm()
      }
      catch {
        Message.error('添加模型失败')
      }
      finally {
        saving.value = false
      }
    }

    const handleRemove = async (id: string) => {
      if (removingId.value)
        return
      removingId.value = id
      try {
        const res = await deleteAgentModelApi({ modelId: id })
        if (res.code !== 0) {
          Message.error('删除失败')
          return
        }
        aiModelStore.removeCustomModel(id)
        Message.success('已删除')
      }
      catch {
        Message.error('删除失败')
      }
      finally {
        removingId.value = ''
      }
    }

    onMounted(() => {
      void loadModels()
    })

    return {
      aiModelStore,
      addVisible,
      saving,
      removingId,
      form,
      canAdd,
      tierLabel,
      openAddDialog,
      handleAdd,
      handleRemove,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-settings-model {
  padding: 4px 0 8px;

  &__heading {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 600;
    color: #2D3436;
  }

  &__card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 16px 18px;
    border: 1px solid #EBEEF5;
    border-radius: 10px;
    background: #F9FAFB;
  }

  &__desc {
    margin: 0;
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.5;
    color: #636E72;
  }

  &__saved {
    margin-top: 28px;
  }

  &__saved-title {
    margin: 0 0 12px;
    font-size: 14px;
    font-weight: 600;
    color: #2D3436;
  }

  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    min-height: 48px;
    padding: 0 14px;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    margin-bottom: 8px;
    background: #FFFFFF;
  }

  &__item-info {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }

  &__item-name {
    font-size: 13px;
    font-weight: 500;
    color: #2D3436;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__item-tags {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }

  &__tag {
    font-size: 10px;
    color: #636E72;
    background: #F1F3F5;
    padding: 1px 6px;
    border-radius: 4px;
  }

  &__item-remove {
    flex-shrink: 0;
    height: 28px;
    padding: 0 12px;
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
    padding: 28px 12px;
    text-align: center;
    font-size: 12px;
    color: #B2BEC3;
    border: 1px dashed #EBEEF5;
    border-radius: 8px;
  }

  &__form {
    display: flex;
    flex-direction: column;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 12px;
    font-size: 12px;
    color: #636E72;
  }

  &__select {
    height: 36px;
    padding: 0 10px;
    border: 1px solid #DCDFE6;
    border-radius: 6px;
    background: #FFFFFF;
    color: #2D3436;
    font-size: 13px;
    outline: none;

    &:focus {
      border-color: #409EFF;
    }
  }

  &__caps {
    margin-top: 4px;
  }

  &__caps-title {
    margin-bottom: 10px;
    font-size: 13px;
    font-weight: 500;
    color: #2D3436;
  }

  &__caps-body {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px 12px;
  }
}
</style>
