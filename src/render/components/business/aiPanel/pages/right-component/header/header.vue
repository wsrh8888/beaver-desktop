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

<!--
  面板顶部品牌行：图标 + 标题 + 一行上下文说明 + 右侧动作。
  标题与副标题是场景文案，由使用方给；图标与额外按钮可被 slot 覆盖。
  新话题读面板 store 自己判断能不能点、自己建，建完只通知外壳清输入框。
-->
<template>
  <header class="ai-header">
    <div class="brand">
      <span class="brand-icon">
        <slot name="icon">
          <img src="renderModule/assets/image/leftBar/assistant_active.svg" alt="">
        </slot>
      </span>
      <div class="brand-text">
        <h3 class="brand-title">
          {{ title }}
        </h3>
        <span v-if="subtitle" class="brand-subtitle" :title="subtitle">
          {{ subtitle }}
        </span>
      </div>
    </div>

    <div class="actions">
      <slot name="actions" />
      <button
        v-if="showNewTopic"
        class="new-topic"
        type="button"
        title="开启新话题"
        :disabled="streaming"
        @click="onNewTopic"
      >
        <span class="plus">+</span> 新话题
      </button>
      <button class="close" type="button" title="关闭" @click="emit('close')">
        <img src="renderModule/assets/image/common/close.svg" alt="关闭">
      </button>
    </div>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { useAiPanelStore } from '../../../store'

export default defineComponent({
  name: 'AiPanelHeader',
  props: {
    title: {
      type: String,
      default: 'AI 助手',
    },
    /** 一行上下文说明，如「就「张三」提问」；空则不渲染 */
    subtitle: {
      type: String,
      default: '',
    },
    /** 场景内绑定 ID：建话题需要它 */
    refId: {
      type: String,
      default: '',
    },
    showNewTopic: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['close', 'newTopic'],
  setup(props, { emit }) {
    const aiStore = useAiPanelStore()

    /** 流式输出中不允许切新话题，避免两路回复打架 */
    const streaming = computed(() => aiStore.isStreaming(props.refId))

    const onNewTopic = () => {
      if (streaming.value || !props.refId)
        return
      aiStore.startNewTopic(props.refId)
      emit('newTopic')
    }

    return { streaming, onNewTopic, emit }
  },
})
</script>

<style lang="less" scoped>
.ai-header {
  flex-shrink: 0;
  height: 68px;
  padding: 0 20px;
  border-bottom: 1px solid #ECEEF0;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    min-width: 0;
  }

  .brand-icon {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 10px;
    background: #FFF1EA;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 20px;
      height: 20px;
    }
  }

  .brand-text {
    min-width: 0;
  }

  .brand-title {
    margin: 0 0 2px;
    font-size: 15px;
    font-weight: 600;
    line-height: 1.2;
    color: #2D3436;
  }

  .brand-subtitle {
    display: block;
    max-width: 260px;
    font-size: 12px;
    color: #8A9196;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .actions {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }

  .new-topic {
    flex-shrink: 0;
    height: 26px;
    padding: 0 10px;
    border: 1px solid #ECEEF0;
    border-radius: 7px;
    background: #fff;
    color: #2D3436;
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 3px;
    transition: border-color 0.15s, color 0.15s;

    &:hover:not(:disabled) {
      border-color: #FF7D45;
      color: #FF7D45;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .plus {
      font-size: 14px;
      line-height: 1;
    }
  }

  .close {
    width: 30px;
    height: 30px;
    flex-shrink: 0;
    border: none;
    border-radius: 8px;
    background: transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;

    &:hover {
      background: #F3F4F6;
    }

    img {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
