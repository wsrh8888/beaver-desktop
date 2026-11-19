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
  一条文本消息：按 role 决定左右与配色，流式中在气泡尾部挂打字点。
  和 IM 的 message/text.vue 同定位 —— 一类消息一个文件，加图片/卡片时在旁边新建即可。
-->
<template>
  <div class="msg" :class="msg.role === 'user' ? 'is-user' : 'is-assistant'">
    <span v-if="msg.role === 'assistant'" class="avatar">
      <img src="renderModule/assets/image/leftBar/assistant_active.svg" alt="">
    </span>
    <div class="bubble">
      <span class="text">{{ msg.content || (msg.streaming ? '' : '—') }}</span>
      <AiTyping v-if="msg.streaming" />
    </div>
  </div>
</template>

<script lang="ts">
import type { IAiChatMessage } from 'commonModule/type/ajax/agent'
import { defineComponent } from 'vue'
import AiTyping from './typing.vue'

export default defineComponent({
  name: 'AiMessageText',
  components: { AiTyping },
  props: {
    msg: {
      type: Object as () => IAiChatMessage,
      required: true,
    },
  },
})
</script>

<style lang="less" scoped>
.msg {
  display: flex;
  gap: 10px;
  align-items: flex-start;

  &.is-user {
    justify-content: flex-end;

    .bubble {
      background: #FF7D45;
      color: #fff;
      border-bottom-right-radius: 4px;
    }
  }

  &.is-assistant {
    .bubble {
      background: #fff;
      color: #2D3436;
      border: 1px solid #ECEEF0;
      border-bottom-left-radius: 4px;
    }
  }

  .avatar {
    width: 26px;
    height: 26px;
    flex-shrink: 0;
    margin-top: 2px;
    border-radius: 8px;
    background: #FFF1EA;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 16px;
      height: 16px;
    }
  }

  .bubble {
    max-width: calc(100% - 36px);
    padding: 10px 13px;
    border-radius: 12px;
    font-size: 13px;
    line-height: 1.65;

    .text {
      white-space: pre-wrap;
      word-break: break-word;
    }
  }
}
</style>
