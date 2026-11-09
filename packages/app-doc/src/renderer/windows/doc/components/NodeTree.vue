<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { INodeItem, ISpaceItem } from '@packageCommon/type/ajax/doc'

defineProps<{
  spaces: ISpaceItem[]
  nodes: INodeItem[]
  currentSpaceId: string
  currentDocId: string
}>()

const emit = defineEmits<{
  (e: 'select-space', spaceId: string): void
  (e: 'open-doc', docId: string, title: string): void
  (e: 'new-page'): void
  (e: 'import'): void
}>()

function onNodeClick(node: INodeItem) {
  if (node.type === 'page' && node.docId)
    emit('open-doc', node.docId, node.title)
}
</script>

<template>
  <aside class="node-tree">
    <div class="node-tree__toolbar">
      <button class="node-tree__btn" @click="emit('new-page')">新建文档</button>
      <button class="node-tree__btn" @click="emit('import')">导入</button>
    </div>

    <div class="node-tree__spaces">
      <div
        v-for="s in spaces"
        :key="s.spaceId"
        class="node-tree__space"
        :class="{ 'is-active': s.spaceId === currentSpaceId }"
        @click="emit('select-space', s.spaceId)"
      >
        {{ s.name }}
      </div>
      <div v-if="!spaces.length" class="node-tree__hint">暂无空间</div>
    </div>

    <ul class="node-tree__nodes">
      <li
        v-for="n in nodes"
        :key="n.nodeId"
        class="node-tree__node"
        :class="{ 'is-active': n.docId && n.docId === currentDocId }"
        @click="onNodeClick(n)"
      >
        <span class="node-tree__icon">{{ n.type === 'folder' ? '📁' : '📄' }}</span>
        <span class="node-tree__title">{{ n.title }}</span>
      </li>
      <li v-if="currentSpaceId && !nodes.length" class="node-tree__hint">
        该空间暂无文档
      </li>
    </ul>
  </aside>
</template>

<style scoped>
.node-tree {
  width: 260px;
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #ececec;
  background: #fafafa;
}
.node-tree__toolbar {
  display: flex;
  gap: 8px;
  padding: 12px;
}
.node-tree__btn {
  flex: 1;
  padding: 6px 8px;
  font-size: 13px;
  border: 1px solid #d0d7de;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
}
.node-tree__spaces {
  padding: 0 12px 8px;
}
.node-tree__space {
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
}
.node-tree__space.is-active {
  background: #e8f0fe;
  color: #1a73e8;
}
.node-tree__nodes {
  list-style: none;
  margin: 0;
  padding: 4px 8px;
  overflow: auto;
  flex: 1;
}
.node-tree__node {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 8px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
}
.node-tree__node:hover {
  background: #f0f0f0;
}
.node-tree__node.is-active {
  background: #e8f0fe;
  color: #1a73e8;
}
.node-tree__hint {
  color: #9aa0a6;
  font-size: 12px;
  padding: 8px;
}
</style>
