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
  <div class="ai-artifact-md">
    <article class="ai-artifact-md__article" v-html="html" />
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue'
import { marked } from 'marked'

/** md 产物渲染器：marked 解析后注入 v-html，样式走 :deep()。 */
export default defineComponent({
  name: 'AiArtifactMd',
  props: {
    content: { type: String, default: '' },
  },
  setup(props) {
    const html = computed(() => marked.parse(props.content || '') as string)
    return { html }
  },
})
</script>

<style lang="less" scoped>
.ai-artifact-md {
  height: 100%;
  overflow: auto;
  padding: 24px 28px;
  box-sizing: border-box;

  &__article {
    max-width: 720px;
    margin: 0 auto;
    font-size: 14px;
    line-height: 1.7;
    color: #2D3436;

    :deep(h1) {
      font-size: 20px;
      margin: 0 0 12px;
    }

    :deep(h2) {
      font-size: 16px;
      margin: 20px 0 10px;
    }

    :deep(h3) {
      font-size: 14px;
      margin: 16px 0 8px;
    }

    :deep(p) {
      margin: 0 0 12px;
    }

    :deep(ul),
    :deep(ol) {
      margin: 0 0 12px;
      padding-left: 22px;
    }

    :deep(li) {
      margin: 4px 0;
    }

    :deep(blockquote) {
      margin: 0 0 12px;
      padding: 8px 12px;
      border-left: 3px solid #FF7D45;
      background: #FFF6F0;
      color: #636E72;
    }

    :deep(code) {
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      background: #F2F4F8;
      padding: 1px 5px;
      border-radius: 4px;
    }

    :deep(pre) {
      background: #2D3436;
      color: #DFE6E9;
      padding: 12px 14px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 0 0 12px;

      code {
        background: none;
        padding: 0;
        color: inherit;
      }
    }

    :deep(a) {
      color: #FF7D45;
    }

    :deep(table) {
      border-collapse: collapse;
      margin: 0 0 12px;
    }

    :deep(th),
    :deep(td) {
      border: 1px solid #EBEEF5;
      padding: 6px 10px;
    }
  }
}
</style>
