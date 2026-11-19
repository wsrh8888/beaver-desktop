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
  AI 面板页，对标 message.vue：把右栏三段摆好，场景参数往下发。
  三段各自对接自己的数据（header 读 store 建话题、content 拉历史、editor 发消息、
  confirm 回传），页面只负责区域顺序，以及「新话题后清输入框」这一处跨区域协作。
-->
<template>
  <AiPanelHeader
    :title="title"
    :subtitle="subtitle"
    :ref-id="refId"
    @new-topic="onNewTopic"
    @close="emit('close')"
  />

  <AiPanelContent
    :visible="visible"
    :ref-id="refId"
    :empty-title="emptyTitle"
    :empty-desc="emptyDesc"
  />

  <AiConfirmPanel :ref-id="refId" />

  <ChatEditor
    ref="editorRef"
    :visible="visible"
    :ref-id="refId"
    :module="module"
    :placeholder="placeholder"
  />
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import ChatEditor from './right-component/bottom/ChatEditor.vue'
import AiConfirmPanel from './right-component/bottom/confirm/index.vue'
import AiPanelContent from './right-component/content/content.vue'
import AiPanelHeader from './right-component/header/header.vue'

/** 输入区只暴露「清空 + 聚焦」，新话题后由页面调 */
interface IEditorHandle {
  reset(): void
  focus(): void
}

export default defineComponent({
  name: 'AiPanelPage',
  components: {
    AiPanelHeader,
    AiPanelContent,
    AiConfirmPanel,
    ChatEditor,
  },
  props: {
    /** 抽屉是否展开（由外层壳给，用于刷历史与抢焦点） */
    visible: {
      type: Boolean,
      default: false,
    },
    /** 场景标识，服务端据此归类对话 */
    module: {
      type: String,
      default: 'chat',
    },
    /** 场景内绑定 ID；话题、消息、确认队列都按它隔离 */
    refId: {
      type: String,
      default: '',
    },
    title: {
      type: String,
      default: 'AI 助手',
    },
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
    const editorRef = ref<IEditorHandle | null>(null)

    // 新话题已由 header 建好，这里只把上一话题残留的草稿清掉并回到输入
    const onNewTopic = () => {
      editorRef.value?.reset()
      editorRef.value?.focus()
    }

    return { editorRef, onNewTopic, emit }
  },
})
</script>
