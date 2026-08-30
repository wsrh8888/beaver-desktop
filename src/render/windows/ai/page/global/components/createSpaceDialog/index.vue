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
    :model-value="true"
    title="新建工作空间"
    width="420px"
    @update:model-value="onDialogVisible"
    @close="handleClose"
  >
    <div class="ai-create-space-dialog">
      <p class="ai-create-space-dialog__desc">
        为工作空间命名，本地将自动创建同名文件夹，命名后不可随意更改
      </p>
      <input
        ref="inputRef"
        v-model="name"
        class="ai-create-space-dialog__input"
        type="text"
        placeholder="请输入工作空间名称"
        maxlength="64"
        @keydown.enter.prevent="handleConfirm"
      >
    </div>

    <template #footer>
      <BeaverButton type="default" @click="handleClose">
        取消
      </BeaverButton>
      <BeaverButton
        type="primary"
        style="margin-left: 8px"
        :disabled="!name.trim()"
        @click="handleConfirm"
      >
        确定
      </BeaverButton>
    </template>
  </BeaverDialog>
</template>

<script lang="ts">
import { defineComponent, nextTick, onMounted, ref } from 'vue'
import BeaverButton from 'renderModule/components/ui/button/index.vue'
import BeaverDialog from 'renderModule/components/ui/dialog/dialog.vue'
import { useAiGlobalStore } from 'renderModule/windows/ai/pinia/global'
import { useAiSpaceStore } from 'renderModule/windows/ai/pinia/space'

export default defineComponent({
  name: 'AiCreateSpaceDialog',
  components: { BeaverDialog, BeaverButton },
  setup() {
    const aiGlobalStore = useAiGlobalStore()
    const aiSpaceStore = useAiSpaceStore()
    const name = ref('')
    const inputRef = ref<HTMLInputElement | null>(null)

    const handleClose = () => {
      aiGlobalStore.setVisible('createSpace', false)
    }

    const onDialogVisible = (visible: boolean) => {
      if (!visible)
        handleClose()
    }

    const handleConfirm = async () => {
      const title = name.value.trim()
      if (!title)
        return
      try {
        await aiSpaceStore.createLocalSpace(title)
        handleClose()
      }
      catch (error: any) {
        window.alert(error?.message || '创建工作空间失败')
      }
    }

    onMounted(async () => {
      await nextTick()
      inputRef.value?.focus()
    })

    return {
      name,
      inputRef,
      handleClose,
      onDialogVisible,
      handleConfirm,
    }
  },
})
</script>

<style lang="less" scoped>
.ai-create-space-dialog {
  &__desc {
    margin: 0 0 16px;
    font-size: 13px;
    line-height: 1.5;
    color: #636E72;
  }

  &__input {
    width: 100%;
    height: 40px;
    padding: 0 12px;
    border: 1px solid #EBEEF5;
    border-radius: 8px;
    outline: none;
    font-size: 13px;
    color: #2D3436;
    box-sizing: border-box;
    font-family: inherit;
    background: #FFFFFF;
    transition: border-color 0.2s;

    &::placeholder {
      color: #B2BEC3;
    }

    &:focus {
      border-color: #FF7D45;
    }
  }
}
</style>
