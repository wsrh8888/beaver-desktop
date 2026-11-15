<!--
  Copyright (c) 2024-2026 Beaver IM Team
  SPDX-License-Identifier: MIT
  Project: beaver-desktop
  https://github.com/wsrh8888/beaver-desktop

  beaver-desktop-header-v2
-->
<script setup lang="ts">
import type { INodeItem } from '@packageCommon/type/ajax/doc'
import { computed, ref } from 'vue'
import { useDocStore } from '../store/doc'

const emit = defineEmits<{
  (e: 'import'): void
  (e: 'export', format: 'md' | 'html' | 'txt' | 'json' | 'docx'): void
  (e: 'duplicate'): void
}>()

const store = useDocStore()
const keyword = ref('')
const collapsed = ref<Set<string>>(new Set())
const newSpaceName = ref('')
const showNewSpace = ref(false)
const menuFor = ref('')
const renameValue = ref('')
const renaming = ref('')

interface ITreeNode {
  node: INodeItem
  children: ITreeNode[]
  depth: number
}

/** 扁平节点按 parentId 组装成树，孤儿节点挂到根，避免数据不一致时整棵树消失。 */
const tree = computed<ITreeNode[]>(() => {
  const map = new Map<string, ITreeNode>()
  for (const n of store.nodes)
    map.set(n.nodeId, { node: n, children: [], depth: 0 })
  const roots: ITreeNode[] = []
  for (const item of map.values()) {
    const parent = item.node.parentId ? map.get(item.node.parentId) : undefined
    if (parent && parent !== item)
      parent.children.push(item)
    else
      roots.push(item)
  }
  const assign = (list: ITreeNode[], depth: number) => {
    list.sort((a, b) => a.node.sort - b.node.sort || a.node.title.localeCompare(b.node.title))
    for (const item of list) {
      item.depth = depth
      assign(item.children, depth + 1)
    }
  }
  assign(roots, 0)
  return roots
})

const visibleTree = computed(() => {
  const out: ITreeNode[] = []
  const walk = (list: ITreeNode[]) => {
    for (const item of list) {
      out.push(item)
      if (!collapsed.value.has(item.node.nodeId))
        walk(item.children)
    }
  }
  walk(tree.value)
  return out
})

function toggle(id: string) {
  const next = new Set(collapsed.value)
  if (next.has(id))
    next.delete(id)
  else
    next.add(id)
  collapsed.value = next
}

async function onSearch() {
  if (!keyword.value.trim()) {
    store.setPanel('none')
    return
  }
  await store.search(keyword.value.trim())
  store.panel = 'search'
}

function openPanel(panel: 'recent' | 'favorites' | 'trash' | 'templates' | 'notifications' | 'audit' | 'blocks') {
  store.panel = panel
  if (panel === 'recent')
    void store.loadRecent()
  if (panel === 'favorites')
    void store.loadFavorites()
  if (panel === 'trash')
    void store.loadTrash()
  if (panel === 'templates')
    void store.loadTemplates()
  if (panel === 'notifications')
    void store.loadNotifications()
  if (panel === 'audit')
    void store.loadAuditLogs()
  if (panel === 'blocks')
    void store.loadBlocks()
}

async function createSpace() {
  const name = newSpaceName.value.trim()
  if (!name)
    return
  await store.createSpace(name)
  newSpaceName.value = ''
  showNewSpace.value = false
}

function startRename(node: INodeItem) {
  renaming.value = node.nodeId
  renameValue.value = node.title
  menuFor.value = ''
}

async function commitRename(node: INodeItem) {
  const title = renameValue.value.trim()
  if (title && title !== node.title)
    await store.renameNode(node.nodeId, title)
  renaming.value = ''
}

async function addChild(node?: INodeItem, folder = false) {
  await store.addPage(node?.nodeId || '', folder ? '新建文件夹' : '未命名文档', folder ? 'folder' : 'doc')
  menuFor.value = ''
}
</script>

<template>
  <aside class="sb">
    <div class="sb__brand">
      <span class="sb__logo">B</span>
      <strong>Beaver 文档</strong>
    </div>

    <div class="sb__search">
      <input
        v-model="keyword"
        class="db-input"
        placeholder="搜索文档标题与正文…"
        @keydown.enter="onSearch"
      >
      <button class="db-btn" @click="onSearch">搜索</button>
    </div>

    <nav class="sb__quick">
      <button @click="openPanel('recent')">🕘 最近访问</button>
      <button @click="openPanel('favorites')">★ 我的收藏</button>
      <button @click="openPanel('templates')">▦ 模板中心</button>
      <button @click="openPanel('trash')">🗑 回收站</button>
      <button @click="openPanel('notifications')">
        🔔 通知中心
        <span v-if="store.unread > 0" class="sb__badge">{{ store.unread }}</span>
      </button>
      <button @click="openPanel('audit')">▤ 操作审计</button>
    </nav>

    <div class="sb__section-head">
      <span>空间</span>
      <button class="db-btn db-btn--ghost" title="新建空间" @click="showNewSpace = !showNewSpace">＋</button>
    </div>
    <div v-if="showNewSpace" class="sb__new">
      <input v-model="newSpaceName" class="db-input" placeholder="空间名称" @keydown.enter="createSpace">
      <button class="db-btn db-btn--primary" @click="createSpace">创建</button>
    </div>
    <div class="sb__spaces">
      <button
        v-for="s in store.spaces"
        :key="s.spaceId"
        class="sb__space"
        :class="{ 'is-active': s.spaceId === store.currentSpaceId }"
        @click="store.selectSpace(s.spaceId)"
      >
        <span>{{ s.icon || '📚' }}</span>
        <span class="sb__space-name">{{ s.name }}</span>
      </button>
      <div v-if="!store.spaces.length" class="db-empty">暂无空间，点击 ＋ 创建</div>
    </div>

    <div class="sb__section-head">
      <span>文档树</span>
      <span class="sb__tree-actions">
        <button class="db-btn db-btn--ghost" title="新建文档" @click="addChild()">＋</button>
        <button class="db-btn db-btn--ghost" title="新建文件夹" @click="addChild(undefined, true)">📁</button>
      </span>
    </div>

    <div class="sb__tree">
      <div
        v-for="item in visibleTree"
        :key="item.node.nodeId"
        class="sb__node"
        :class="{ 'is-active': item.node.docId && item.node.docId === store.currentDocId }"
        :style="{ paddingLeft: `${8 + item.depth * 14}px` }"
        @click="item.node.docId && store.openDoc(item.node.docId)"
      >
        <button class="sb__caret" @click.stop="toggle(item.node.nodeId)">
          {{ item.children.length ? (collapsed.has(item.node.nodeId) ? '▸' : '▾') : '·' }}
        </button>
        <span class="sb__icon">{{ item.node.type === 'folder' ? '📁' : (item.node.icon || '📄') }}</span>
        <input
          v-if="renaming === item.node.nodeId"
          v-model="renameValue"
          class="db-input sb__rename"
          autofocus
          @click.stop
          @keydown.enter="commitRename(item.node)"
          @blur="commitRename(item.node)"
        >
        <span v-else class="sb__node-title">{{ item.node.title }}</span>
        <button class="sb__more" @click.stop="menuFor = menuFor === item.node.nodeId ? '' : item.node.nodeId">⋯</button>
        <div v-if="menuFor === item.node.nodeId" class="sb__menu" @click.stop>
          <button @click="startRename(item.node)">重命名</button>
          <button @click="addChild(item.node)">新建子文档</button>
          <button @click="addChild(item.node, true)">新建子文件夹</button>
          <button @click="emit('duplicate'); menuFor = ''">创建副本</button>
          <button @click="emit('export', 'md'); menuFor = ''">导出 Markdown</button>
          <button class="db-btn--danger" @click="store.removeNode(item.node.nodeId); menuFor = ''">移入回收站</button>
        </div>
      </div>
      <div v-if="!visibleTree.length" class="db-empty">该空间暂无文档</div>
    </div>

    <div class="sb__foot">
      <button class="db-btn" @click="emit('import')">导入 docx / pdf</button>
      <button class="db-btn" :disabled="!store.currentDocId" @click="emit('export', 'docx')">导出 Word</button>
    </div>
  </aside>
</template>

<style scoped>
.sb {
  width: 252px; flex: none; height: 100%; display: flex; flex-direction: column;
  background: #f7f8fa; border-right: 1px solid #e8eaed; font-size: 12px;
}
.sb__brand { display: flex; align-items: center; gap: 8px; padding: 12px 14px; font-size: 14px; }
.sb__logo {
  width: 22px; height: 22px; border-radius: 6px; background: #3370ff; color: #fff;
  display: flex; align-items: center; justify-content: center; font-weight: 700;
}
.sb__search { display: flex; gap: 6px; padding: 0 12px 10px; }
.sb__quick { display: flex; flex-direction: column; padding: 0 8px 8px; border-bottom: 1px solid #e8eaed; }
.sb__quick button {
  display: flex; align-items: center; gap: 8px; text-align: left; padding: 6px 8px;
  border: none; background: transparent; border-radius: 6px; cursor: pointer; font-size: 12px; color: #1f2329;
}
.sb__quick button:hover { background: #eceff3; }
.sb__badge { margin-left: auto; background: #f54a45; color: #fff; border-radius: 9px; padding: 0 5px; font-size: 10px; }
.sb__section-head {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 12px 4px; font-size: 11px; color: #8f959e; font-weight: 600;
  letter-spacing: .04em; text-transform: uppercase;
}
.sb__tree-actions { display: flex; gap: 2px; }
.sb__new { display: flex; gap: 6px; padding: 0 12px 8px; }
.sb__spaces { max-height: 140px; overflow: auto; padding: 0 8px 8px; border-bottom: 1px solid #e8eaed; }
.sb__space {
  display: flex; align-items: center; gap: 8px; width: 100%; padding: 6px 8px;
  border: none; background: transparent; border-radius: 6px; cursor: pointer; text-align: left; font-size: 12px;
}
.sb__space:hover { background: #eceff3; }
.sb__space.is-active { background: #e1eaff; color: #245bdb; font-weight: 600; }
.sb__space-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sb__tree { flex: 1; overflow: auto; padding: 2px 8px; position: relative; }
.sb__node {
  position: relative; display: flex; align-items: center; gap: 5px; height: 28px;
  border-radius: 6px; cursor: pointer; padding-right: 6px;
}
.sb__node:hover { background: #eceff3; }
.sb__node.is-active { background: #e1eaff; color: #245bdb; }
.sb__caret, .sb__more { border: none; background: transparent; cursor: pointer; color: #8f959e; font-size: 11px; padding: 0 2px; }
.sb__more { margin-left: auto; opacity: 0; }
.sb__node:hover .sb__more { opacity: 1; }
.sb__icon { font-size: 12px; }
.sb__node-title { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sb__rename { height: 22px; padding: 2px 6px; font-size: 12px; }
.sb__menu {
  position: absolute; right: 4px; top: 26px; z-index: 30; min-width: 148px; padding: 4px;
  background: #fff; border: 1px solid #e8eaed; border-radius: 8px; box-shadow: 0 8px 24px rgba(0,0,0,.12);
}
.sb__menu button {
  display: block; width: 100%; text-align: left; padding: 6px 8px; font-size: 11px;
  border: none; background: transparent; border-radius: 5px; cursor: pointer;
}
.sb__menu button:hover { background: #f2f3f5; }
.sb__foot { display: flex; gap: 6px; padding: 10px; border-top: 1px solid #e8eaed; }
.sb__foot .db-btn { flex: 1; }
</style>
