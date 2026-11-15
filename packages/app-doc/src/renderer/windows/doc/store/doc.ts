/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  IAuditLogItem,
  ICollaboratorItem,
  ICommentItem,
  IDocBlockItem,
  IDocItem,
  IDocSearchItem,
  INodeItem,
  INotificationItem,
  IPermItem,
  IRevisionItem,
  IShareLinkItem,
  ISpaceItem,
  ITemplateItem,
  ITrashItem,
} from '@packageCommon/type/ajax/doc'
import {
  createCommentApi,
  createDocApi,
  createNodeApi,
  createSpaceApi,
  createTemplateApi,
  deleteCommentApi,
  deleteDocApi,
  deleteDocBlockApi,
  deleteNodeApi,
  deletePermissionApi,
  deleteTemplateApi,
  duplicateDocApi,
  emptyTrashApi,
  exportDocApi,
  getDocApi,
  getShareLinkApi,
  instantiateTemplateApi,
  labelRevisionApi,
  listAuditLogsApi,
  listCollaboratorsApi,
  listCommentsApi,
  listDocBlocksApi,
  listFavoritesApi,
  listNodesApi,
  listNotificationsApi,
  listPermissionsApi,
  listRecentApi,
  listRevisionsApi,
  listSpacesApi,
  listTemplatesApi,
  listTrashApi,
  markNotificationReadApi,
  diffRevisionsApi,
  purgeTrashApi,
  recordVisitApi,
  reindexDocApi,
  resolveCommentApi,
  restoreTrashApi,
  revokeShareLinkApi,
  rollbackRevisionApi,
  saveDocBlockApi,
  saveDocContentApi,
  searchDocsApi,
  setFavoriteApi,
  setKnowledgeSyncApi,
  setPermissionApi,
  setShareLinkApi,
  updateDocMetaApi,
  updateNodeApi,
  updateSpaceApi,
  listDocsApi,
} from '@packageRender/api/doc'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export type DocPanel =
  | 'none'
  | 'history'
  | 'comments'
  | 'collab'
  | 'audit'
  | 'trash'
  | 'notifications'
  | 'templates'
  | 'search'
  | 'blocks'
  | 'recent'
  | 'favorites'

/** ajax 统一返回 IAjaxResponse<T>；这里把业务结果拆出来，非 0 抛错交给 UI 提示。 */
async function unwrap<T>(p: Promise<{ code: number, msg: string, result?: T }>): Promise<T | undefined> {
  const res = await p
  if (res.code !== 0)
    throw new Error(res.msg || '请求失败')
  return res.result
}

/**
 * 文档工作台状态：导航骨架 + 所有侧栏能力的数据源。
 * 正文编辑不进 store（TipTap/Yjs 直连协同网关），store 只管元信息与面板数据。
 */
export const useDocStore = defineStore('doc', () => {
  // ---------- 导航 ----------
  const spaces = ref<ISpaceItem[]>([])
  const currentSpaceId = ref('')
  const nodes = ref<INodeItem[]>([])
  const currentDoc = ref<IDocItem | null>(null)
  const loading = ref(false)
  const error = ref('')

  // ---------- 工作台列表 ----------
  const recent = ref<IDocItem[]>([])
  const favorites = ref<IDocItem[]>([])
  const docs = ref<IDocItem[]>([])
  const searchResults = ref<IDocSearchItem[]>([])
  const trash = ref<ITrashItem[]>([])
  const templates = ref<ITemplateItem[]>([])
  const notifications = ref<INotificationItem[]>([])
  const unread = ref(0)
  const auditLogs = ref<IAuditLogItem[]>([])
  const comments = ref<ICommentItem[]>([])
  const collaborators = ref<ICollaboratorItem[]>([])
  const permissions = ref<IPermItem[]>([])
  const revisions = ref<IRevisionItem[]>([])
  const blocks = ref<IDocBlockItem[]>([])
  const shareLink = ref<IShareLinkItem | null>(null)

  // ---------- UI ----------
  const panel = ref<DocPanel>('none')
  const searchQuery = ref('')
  const epoch = ref(0)
  const favoriteIds = computed(() => new Set(favorites.value.map(d => d.docId)))
  const currentDocId = computed(() => currentDoc.value?.docId || '')

  function toast(err: unknown) {
    error.value = err instanceof Error ? err.message : String(err)
  }

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    loading.value = true
    error.value = ''
    try {
      return await fn()
    }
    catch (err) {
      toast(err)
      return undefined
    }
    finally {
      loading.value = false
    }
  }

  // ---------- 空间 / 节点 ----------
  async function loadSpaces() {
    const r = await run(() => unwrap(listSpacesApi({ page: 1, pageSize: 200 })))
    spaces.value = r?.spaces || []
    if (!currentSpaceId.value && spaces.value.length)
      currentSpaceId.value = spaces.value[0].spaceId
  }

  async function createSpace(name: string, kind = 'owner') {
    const r = await run(() => unwrap(createSpaceApi({ name, kind })))
    if (r?.spaceId) {
      await loadSpaces()
      await selectSpace(r.spaceId)
    }
  }

  async function updateSpace(spaceId: string, patch: { name?: string, icon?: string, description?: string }) {
    await run(() => unwrap(updateSpaceApi({ spaceId, ...patch })))
    await loadSpaces()
  }

  async function selectSpace(spaceId: string) {
    currentSpaceId.value = spaceId
    currentDoc.value = null
    const r = await run(() => unwrap(listNodesApi({ spaceId })))
    nodes.value = r?.nodes || []
    await loadSpaceDocs()
  }

  async function loadSpaceDocs() {
    if (!currentSpaceId.value)
      return
    const r = await run(() => unwrap(listDocsApi({ spaceId: currentSpaceId.value, page: 1, pageSize: 200 })))
    docs.value = r?.docs || []
  }

  async function addPage(parentId = '', title = '未命名文档', docType = 'doc') {
    if (!currentSpaceId.value)
      return
    const r = await run(() => unwrap(createNodeApi({
      spaceId: currentSpaceId.value,
      parentId,
      title,
      type: docType === 'folder' ? 'folder' : 'page',
    })))
    await selectSpace(currentSpaceId.value)
    if (r?.docId)
      await openDoc(r.docId)
    return r
  }

  async function createDocUnderParent(parentId: string, title: string, contentJson?: string) {
    if (!currentSpaceId.value)
      return
    const r = await run(() => unwrap(createDocApi({
      spaceId: currentSpaceId.value,
      title,
      contentJson,
    })))
    await selectSpace(currentSpaceId.value)
    if (r?.docId)
      await openDoc(r.docId)
    return r
  }

  async function renameNode(nodeId: string, title: string) {
    await run(() => unwrap(updateNodeApi({ nodeId, title })))
    await selectSpace(currentSpaceId.value)
  }

  async function moveNode(nodeId: string, parentId: string) {
    await run(() => unwrap(updateNodeApi({ nodeId, parentId })))
    await selectSpace(currentSpaceId.value)
  }

  async function removeNode(nodeId: string) {
    await run(() => unwrap(deleteNodeApi({ nodeId })))
    await selectSpace(currentSpaceId.value)
  }

  // ---------- 文档 ----------
  async function openDoc(docId: string) {
    const r = await run(() => unwrap(getDocApi({ docId })))
    if (!r?.doc)
      return
    currentDoc.value = r.doc
    epoch.value = r.doc.epoch || 1
    // 访问记录用于"最近访问"，失败不影响打开。
    void unwrap(recordVisitApi({ docId })).catch(() => undefined)
    await refreshDocPanels()
  }

  async function refreshDocPanels() {
    if (!currentDocId.value)
      return
    await Promise.all([
      loadComments(),
      loadRevisions(),
      loadCollaborators(),
      loadShareLink(),
      loadBlocks(),
      loadFavorites(),
    ])
  }

  async function updateMeta(patch: { title?: string, icon?: string, cover?: string, docType?: string, ragEnabled?: boolean }) {
    if (!currentDocId.value)
      return
    const body: Record<string, unknown> = { docId: currentDocId.value, ...patch }
    if (typeof patch.ragEnabled === 'boolean')
      body.ragEnabledSet = true
    await run(() => unwrap(updateDocMetaApi(body as any)))
    await openDoc(currentDocId.value)
  }

  async function removeDoc() {
    if (!currentDocId.value)
      return
    await run(() => unwrap(deleteDocApi({ docId: currentDocId.value })))
    currentDoc.value = null
    await selectSpace(currentSpaceId.value)
  }

  /** HTTP 兜底保存（协同不可用 / 富媒体块等非 CRDT 内容），返回新版本号。 */
  async function saveContent(contentJson: string, contentText = '') {
    const r = await run(() => unwrap(saveDocContentApi({
      docId: currentDocId.value,
      contentJson,
      contentText,
    })))
    if (r?.version && currentDoc.value)
      currentDoc.value.version = r.version
    return r
  }

  async function duplicateDoc(title?: string) {
    const r = await run(() => unwrap(duplicateDocApi({ docId: currentDocId.value, title })))
    if (r?.docId) {
      await selectSpace(currentSpaceId.value)
      await openDoc(r.docId)
    }
    return r
  }

  async function exportDoc(format: 'md' | 'html' | 'txt' | 'json' | 'docx') {
    return run(() => unwrap(exportDocApi({ docId: currentDocId.value, format })))
  }

  async function setKnowledgeSync(enabled: boolean) {
    await run(() => unwrap(setKnowledgeSyncApi({ docId: currentDocId.value, ragEnabled: enabled })))
    await openDoc(currentDocId.value)
  }

  async function reindex() {
    return run(() => unwrap(reindexDocApi({ docId: currentDocId.value })))
  }

  async function toggleFavorite() {
    if (!currentDocId.value)
      return
    const next = !favoriteIds.value.has(currentDocId.value)
    await run(() => unwrap(setFavoriteApi({ docId: currentDocId.value, favorite: next })))
    await loadFavorites()
  }

  async function loadFavorites() {
    const r = await unwrap(listFavoritesApi({ page: 1, pageSize: 200 }))
    favorites.value = r?.docs || []
  }

  async function loadRecent() {
    const r = await run(() => unwrap(listRecentApi({ page: 1, pageSize: 100 })))
    recent.value = r?.docs || []
  }

  async function search(query: string, spaceId?: string) {
    searchQuery.value = query
    const r = await run(() => unwrap(searchDocsApi({ query, spaceId, page: 1, pageSize: 100 })))
    searchResults.value = r?.items || []
  }

  // ---------- 评论 ----------
  async function loadComments(includeResolved = true) {
    if (!currentDocId.value)
      return
    const r = await unwrap(listCommentsApi({ docId: currentDocId.value, includeResolved }))
    comments.value = r?.comments || []
  }

  async function createComment(content: string, opts: { parentId?: string, anchorId?: string, quote?: string, mentions?: string } = {}) {
    await run(() => unwrap(createCommentApi({ docId: currentDocId.value, content, ...opts })))
    await loadComments()
    await loadNotifications()
  }

  async function resolveComment(commentId: string, resolved: boolean) {
    await run(() => unwrap(resolveCommentApi({ commentId, resolved })))
    await loadComments()
  }

  async function deleteComment(commentId: string) {
    await run(() => unwrap(deleteCommentApi({ commentId })))
    await loadComments()
  }

  // ---------- 版本历史 ----------
  async function loadRevisions() {
    if (!currentDocId.value)
      return
    const r = await unwrap(listRevisionsApi({ docId: currentDocId.value, page: 1, pageSize: 100 }))
    revisions.value = r?.revisions || []
  }

  async function labelRevision(revisionId: string, label: string) {
    await run(() => unwrap(labelRevisionApi({ revisionId, label })))
    await loadRevisions()
  }

  async function diffRevisions(baseRevisionId: string, targetRevisionId: string) {
    return run(() => unwrap(diffRevisionsApi({ docId: currentDocId.value, baseRevisionId, targetRevisionId })))
  }

  async function rollback(revisionId: string) {
    const r = await run(() => unwrap(rollbackRevisionApi({ docId: currentDocId.value, revisionId })))
    if (r?.epoch) {
      // 关键：纪元变化后必须让编辑器销毁旧 Y.Doc 并按新 epoch 重建。
      epoch.value = r.epoch
      await openDoc(currentDocId.value)
      epoch.value = r.epoch
      await loadRevisions()
    }
    return r
  }

  // ---------- 权限 / 分享 / 协作者 ----------
  async function loadPermissions(resourceType = 'doc') {
    if (!currentDocId.value)
      return
    const r = await unwrap(listPermissionsApi({ resourceType, resourceId: currentDocId.value }))
    permissions.value = r?.permissions || []
  }

  async function addPermission(principalId: string, role: string) {
    await run(() => unwrap(setPermissionApi({
      resourceType: 'doc',
      resourceId: currentDocId.value,
      principalType: 'user',
      principalId,
      role,
    })))
    await loadPermissions()
    await loadCollaborators()
  }

  async function removePermission(p: IPermItem) {
    await run(() => unwrap(deletePermissionApi({
      resourceType: p.resourceType,
      resourceId: p.resourceId,
      principalType: p.principalType,
      principalId: p.principalId,
    })))
    await loadPermissions()
    await loadCollaborators()
  }

  async function loadCollaborators() {
    if (!currentDocId.value)
      return
    const r = await unwrap(listCollaboratorsApi({ docId: currentDocId.value }))
    collaborators.value = r?.collaborators || []
  }

  async function loadShareLink() {
    if (!currentDocId.value)
      return
    const r = await unwrap(getShareLinkApi({ resourceType: 'doc', resourceId: currentDocId.value }))
    shareLink.value = r?.link || null
  }

  async function saveShareLink(patch: Record<string, unknown>) {
    const r = await run(() => unwrap(setShareLinkApi({
      resourceType: 'doc',
      resourceId: currentDocId.value,
      ...patch,
    } as any)))
    shareLink.value = r?.link || null
    return r?.link
  }

  async function revokeShareLink() {
    if (!shareLink.value?.linkId)
      return
    await run(() => unwrap(revokeShareLinkApi({ linkId: shareLink.value!.linkId })))
    shareLink.value = null
  }

  // ---------- 回收站 / 模板 / 通知 / 审计 ----------
  async function loadTrash() {
    const r = await run(() => unwrap(listTrashApi({ page: 1, pageSize: 200 })))
    trash.value = r?.items || []
  }

  async function restoreTrash(trashId: string) {
    await run(() => unwrap(restoreTrashApi({ trashId })))
    await loadTrash()
    await selectSpace(currentSpaceId.value)
  }

  async function purgeTrash(trashId: string) {
    await run(() => unwrap(purgeTrashApi({ trashId })))
    await loadTrash()
  }

  async function emptyTrash() {
    await run(() => unwrap(emptyTrashApi({})))
    await loadTrash()
  }

  async function loadTemplates(category?: string) {
    const r = await run(() => unwrap(listTemplatesApi({ category, page: 1, pageSize: 100 })))
    templates.value = r?.templates || []
  }

  async function createTemplate(name: string, contentJson: string, category = 'custom') {
    const r = await run(() => unwrap(createTemplateApi({ name, contentJson, category })))
    await loadTemplates()
    return r
  }

  async function useTemplate(templateId: string, title?: string) {
    const r = await run(() => unwrap(instantiateTemplateApi({
      templateId,
      spaceId: currentSpaceId.value,
      title,
    })))
    if (r?.docId) {
      await selectSpace(currentSpaceId.value)
      await openDoc(r.docId)
    }
    return r
  }

  async function deleteTemplate(templateId: string) {
    await run(() => unwrap(deleteTemplateApi({ templateId })))
    await loadTemplates()
  }

  async function loadNotifications(unreadOnly = false) {
    const r = await unwrap(listNotificationsApi({ unreadOnly, page: 1, pageSize: 100 }))
    notifications.value = r?.items || []
    unread.value = r?.unread || 0
  }

  async function markRead(notificationId?: string, all = false) {
    const r = await run(() => unwrap(markNotificationReadApi({ notificationId, all })))
    if (typeof r?.unread === 'number')
      unread.value = r.unread
    await loadNotifications()
  }

  async function loadAuditLogs(filters: { actorUserId?: string, action?: string, resourceId?: string } = {}) {
    const r = await run(() => unwrap(listAuditLogsApi({ ...filters, page: 1, pageSize: 200 })))
    auditLogs.value = r?.logs || []
  }

  // ---------- 富媒体块 ----------
  async function loadBlocks() {
    if (!currentDocId.value)
      return
    const r = await unwrap(listDocBlocksApi({ docId: currentDocId.value }))
    blocks.value = r?.blocks || []
  }

  async function saveBlock(blockId: string | undefined, kind: string, title: string, payloadJson: string) {
    await run(() => unwrap(saveDocBlockApi({ docId: currentDocId.value, blockId, kind, title, payloadJson })))
    await loadBlocks()
  }

  async function deleteBlock(blockId: string) {
    await run(() => unwrap(deleteDocBlockApi({ docId: currentDocId.value, blockId })))
    await loadBlocks()
  }

  function setPanel(next: DocPanel) {
    panel.value = panel.value === next ? 'none' : next
  }

  return {
    // state
    spaces, currentSpaceId, nodes, currentDoc, currentDocId, loading, error,
    recent, favorites, docs, searchResults, trash, templates, notifications,
    unread, auditLogs, comments, collaborators, permissions, revisions, blocks,
    shareLink, panel, searchQuery, epoch, favoriteIds,
    // actions
    toast, loadSpaces, createSpace, updateSpace, selectSpace, loadSpaceDocs,
    addPage, createDocUnderParent, renameNode, moveNode, removeNode,
    openDoc, refreshDocPanels, updateMeta, removeDoc, saveContent, duplicateDoc,
    exportDoc, setKnowledgeSync, reindex, toggleFavorite, loadFavorites,
    loadRecent, search,
    loadComments, createComment, resolveComment, deleteComment,
    loadRevisions, labelRevision, diffRevisions, rollback,
    loadPermissions, addPermission, removePermission, loadCollaborators,
    loadShareLink, saveShareLink, revokeShareLink,
    loadTrash, restoreTrash, purgeTrash, emptyTrash,
    loadTemplates, createTemplate, useTemplate, deleteTemplate,
    loadNotifications, markRead, loadAuditLogs,
    loadBlocks, saveBlock, deleteBlock,
    setPanel,
  }
})
