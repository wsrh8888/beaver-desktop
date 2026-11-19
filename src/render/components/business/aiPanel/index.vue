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
  AI 面板出口。用的时候只 import 这一个文件：
    <AiPanel :visible="..." module="chat" :ref-id="conversationId" @close="..." />

  这层只管抽屉：定位、滑入动画、遮罩、场景参数透传。
  里面是一个独立的「小 IM」（pages/aiPanel.vue），自带数据与推送：
    pages/                 视图（header / content / bottom）
    notification-manager/  ws 推送（流式回复、确认请求）
    store/                 数据（话题、消息、确认队列）
    api/                   接口（话题、历史、发送、回传）
-->
<template>
  <div class="ai-panel app__no_drag">
    <aside class="drawer" :class="{ active: visible }">
      <AiPanelPage
        :visible="visible"
        :module="module"
        :ref-id="refId"
        :title="title"
        :subtitle="subtitle"
        :empty-title="emptyTitle"
        :empty-desc="emptyDesc"
        :placeholder="placeholder"
        @close="emit('close')"
      />
    </aside>

    <div
      class="overlay"
      :class="{ active: visible }"
      @click="emit('close')"
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import AiPanelPage from './pages/aiPanel.vue'

export default defineComponent({
  name: 'AiPanel',
  components: { AiPanelPage },
  props: {
    /** 抽屉是否展开 */
    visible: {
      type: Boolean,
      default: false,
    },
    /** 场景标识，决定服务端把对话归到哪：chat / circle / moment … */
    module: {
      type: String,
      default: 'chat',
    },
    /** 场景内绑定 ID（如 IM conversationId）；每个 refId 独立话题与历史 */
    refId: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'AI 助手',
    },
    /** 一行上下文说明，如「就「张三」提问」；空则不显示 */
    subtitle: {
      type: String,
      default: '',
    },
    emptyTitle: {
      type: String,
      default: '开始提问',
    },
    emptyDesc: {
      type: String,
      default: '',
    },
    placeholder: {
      type: String,
      default: '问点什么…',
    },
  },
  emits: ['close'],
  setup(_props, { emit }) {
    return { emit }
  },
})
</script>

<style lang="less" scoped>
/* 只留抽屉本身：定位、滑入、遮罩。页面内容样式在 pages 里 */
.ai-panel {
  .drawer {
    position: fixed;
    top: 0;
    right: -400px;
    width: 400px;
    height: 100%;
    background: #fff;
    z-index: 100;
    display: flex;
    flex-direction: column;
    transition: right 0.3s cubic-bezier(0.33, 1, 0.68, 1);

    &.active {
      right: 0;
    }
  }

  .overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.28);
    z-index: 90;
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.3s, visibility 0.3s;

    &.active {
      opacity: 1;
      visibility: visible;
      pointer-events: auto;
    }
  }
}
</style>
