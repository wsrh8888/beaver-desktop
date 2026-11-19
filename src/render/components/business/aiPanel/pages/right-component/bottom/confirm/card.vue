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
  AI 待办确认卡：agent 要动手、需本人点头的动作都走这张卡。
  只管形态（标题 / 正文 / 倒计时 / 双按钮），语义全由调用方给：
    title       动作名，如「以你的名义发送」「删除这个文件」
    content     正文，如待发消息原文、待删除项
    confirmText 主按钮文案，如「发送」「删除」「允许」
    cancelText  次按钮文案，默认「取消」
    tone        default 走主色；danger 用于删除等不可逆动作
  所以新增一类动作不用改组件，agent 侧把文案带上即可。

  倒计时自己跑：到点抛 expire，使用方据此把「否」回传服务端，免得服务端干等满超时。
  busy 期间按钮置灰，防止连点重复提交。
-->
<template>
  <div class="ai-confirm" :class="{ 'is-danger': tone === 'danger' }">
    <div class="head">
      <span class="dot" />
      <span class="title">{{ title }}</span>
      <span v-if="expiresAt > 0" class="countdown">{{ remain }}s</span>
    </div>
    <div class="body">
      {{ content }}
    </div>
    <div class="actions">
      <button
        class="btn"
        type="button"
        :disabled="busy"
        @click="emit('cancel')"
      >
        {{ cancelText }}
      </button>
      <button
        class="btn is-primary"
        type="button"
        :disabled="busy"
        @click="emit('confirm')"
      >
        {{ confirmText }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onUnmounted, ref, watch } from 'vue'

export default defineComponent({
  name: 'AiPanelConfirmCard',
  props: {
    /** 动作名，由调用方（agent）决定 */
    title: {
      type: String,
      default: '需要你确认',
    },
    /** 正文，由调用方决定 */
    content: {
      type: String,
      default: '',
    },
    /** 主按钮文案：发送 / 删除 / 允许 / 确认 */
    confirmText: {
      type: String,
      default: '确认',
    },
    cancelText: {
      type: String,
      default: '取消',
    },
    /** danger 用于删除等不可逆动作，主按钮与左边条转红 */
    tone: {
      type: String,
      default: 'default',
    },
    /** 过期时间戳（毫秒），与服务端挂起超时对齐；0 表示不倒计时 */
    expiresAt: {
      type: Number,
      default: 0,
    },
    /** 回传中：按钮置灰，避免重复提交 */
    busy: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['confirm', 'cancel', 'expire'],
  setup(props, { emit }) {
    const remain = ref(0)
    let timer: ReturnType<typeof setInterval> | null = null

    const stop = () => {
      if (timer) {
        clearInterval(timer)
        timer = null
      }
    }

    const start = (expiresAt: number) => {
      stop()
      const tick = () => {
        const rest = Math.max(0, Math.ceil((expiresAt - Date.now()) / 1000))
        remain.value = rest
        if (rest > 0)
          return
        stop()
        emit('expire')
      }
      tick()
      timer = setInterval(tick, 1000)
    }

    watch(() => props.expiresAt, (v) => {
      if (v > 0)
        start(v)
      else
        stop()
    }, { immediate: true })

    onUnmounted(stop)

    return { remain, emit }
  },
})
</script>

<style lang="less" scoped>
.ai-confirm {
  flex-shrink: 0;
  margin: 0 16px 8px;
  padding: 10px 12px;
  border: 1px solid #ECEEF0;
  border-left: 3px solid #FF7D45;
  border-radius: 10px;
  background: #FFF1EA;

  /* 危险动作：整张卡换成告警红，让人不会顺手点下去 */
  &.is-danger {
    border-left-color: #FF5252;
    background: #FFF0F0;

    .dot {
      background: #FF5252;
    }

    .btn.is-primary {
      border-color: #FF5252;
      background: #FF5252;

      &:hover:not(:disabled) {
        background: #E64343;
        border-color: #E64343;
      }
    }
  }

  .head {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 6px;
  }

  .dot {
    width: 6px;
    height: 6px;
    flex-shrink: 0;
    border-radius: 50%;
    background: #FF7D45;
  }

  .title {
    flex: 1;
    font-size: 12px;
    font-weight: 600;
    color: #2D3436;
  }

  .countdown {
    font-size: 11px;
    color: #8A9196;
    font-variant-numeric: tabular-nums;
  }

  .body {
    max-height: 96px;
    overflow-y: auto;
    padding: 8px 10px;
    border-radius: 8px;
    background: #fff;
    color: #2D3436;
    font-size: 13px;
    line-height: 1.55;
    white-space: pre-wrap;
    word-break: break-word;
  }

  .actions {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 8px;
  }

  .btn {
    height: 26px;
    padding: 0 14px;
    border: 1px solid #ECEEF0;
    border-radius: 7px;
    background: #fff;
    color: #2D3436;
    font-size: 12px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s;

    &:hover:not(:disabled) {
      background: #FAFBFC;
      border-color: #DFE3E6;
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    &.is-primary {
      border-color: #FF7D45;
      background: #FF7D45;
      color: #fff;

      &:hover:not(:disabled) {
        background: #F26A2E;
        border-color: #F26A2E;
      }
    }
  }
}
</style>
