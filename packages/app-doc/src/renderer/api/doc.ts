/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type * as T from '@packageCommon/type/ajax/doc'
import { ajax, getBaseUrl } from '@beaver-im/beaver/renderer'

const base = () => `${getBaseUrl()}/api/doc/v1`

/** 统一 POST：userId 由 ajax 请求层注入 Beaver-User-Id header，业务入参只带领域字段。 */
function post<Req, Res>(path: string, data: Req) {
  return ajax<Res>({ method: 'POST', data, url: `${base()}${path}` })
}

// ==================== 空间 space ====================
export const createSpaceApi = (data: T.ICreateSpaceReq) => post<T.ICreateSpaceReq, T.ICreateSpaceRes>('/space/create', data)
export const updateSpaceApi = (data: T.IUpdateSpaceReq) => post<T.IUpdateSpaceReq, T.IUpdateSpaceRes>('/space/update', data)
export const deleteSpaceApi = (data: T.IDeleteSpaceReq) => post<T.IDeleteSpaceReq, T.IDeleteSpaceRes>('/space/delete', data)
export const getSpaceApi = (data: T.IGetSpaceReq) => post<T.IGetSpaceReq, T.IGetSpaceRes>('/space/get', data)
export const listSpacesApi = (data: T.IListSpacesReq) => post<T.IListSpacesReq, T.IListSpacesRes>('/space/list', data)

// ==================== 节点 node ====================
export const createNodeApi = (data: T.ICreateNodeReq) => post<T.ICreateNodeReq, T.ICreateNodeRes>('/node/create', data)
export const updateNodeApi = (data: T.IUpdateNodeReq) => post<T.IUpdateNodeReq, T.IUpdateNodeRes>('/node/update', data)
export const deleteNodeApi = (data: T.IDeleteNodeReq) => post<T.IDeleteNodeReq, T.IDeleteNodeRes>('/node/delete', data)
export const listNodesApi = (data: T.IListNodesReq) => post<T.IListNodesReq, T.IListNodesRes>('/node/list', data)

// ==================== 文档 document ====================
export const createDocApi = (data: T.ICreateDocReq) => post<T.ICreateDocReq, T.ICreateDocRes>('/doc/create', data)
export const getDocApi = (data: T.IGetDocReq) => post<T.IGetDocReq, T.IGetDocRes>('/doc/get', data)
export const updateDocMetaApi = (data: T.IUpdateDocMetaReq) => post<T.IUpdateDocMetaReq, T.IUpdateDocMetaRes>('/doc/updateMeta', data)
export const deleteDocApi = (data: T.IDeleteDocReq) => post<T.IDeleteDocReq, T.IDeleteDocRes>('/doc/delete', data)
export const saveDocContentApi = (data: T.ISaveDocContentReq) => post<T.ISaveDocContentReq, T.ISaveDocContentRes>('/doc/saveContent', data)
export const getDocSyncStateApi = (data: T.IGetDocSyncStateReq) => post<T.IGetDocSyncStateReq, T.IGetDocSyncStateRes>('/doc/syncState', data)
export const importDocApi = (data: T.IImportDocReq) => post<T.IImportDocReq, T.IImportDocRes>('/doc/import', data)
export const searchDocsApi = (data: T.ISearchDocsReq) => post<T.ISearchDocsReq, T.ISearchDocsRes>('/doc/search', data)
export const listDocsApi = (data: T.IListDocsReq) => post<T.IListDocsReq, T.IListDocsRes>('/doc/list', data)
export const recordVisitApi = (data: T.IRecordVisitReq) => post<T.IRecordVisitReq, T.IRecordVisitRes>('/doc/visit', data)
export const listRecentApi = (data: T.IListRecentReq) => post<T.IListRecentReq, T.IListRecentRes>('/doc/listRecent', data)
export const setFavoriteApi = (data: T.ISetFavoriteReq) => post<T.ISetFavoriteReq, T.ISetFavoriteRes>('/doc/favorite', data)
export const listFavoritesApi = (data: T.IListFavoritesReq) => post<T.IListFavoritesReq, T.IListFavoritesRes>('/doc/listFavorites', data)
export const exportDocApi = (data: T.IExportDocReq) => post<T.IExportDocReq, T.IExportDocRes>('/doc/export', data)
export const duplicateDocApi = (data: T.IDuplicateDocReq) => post<T.IDuplicateDocReq, T.IDuplicateDocRes>('/doc/duplicate', data)
export const setKnowledgeSyncApi = (data: T.ISetKnowledgeSyncReq) => post<T.ISetKnowledgeSyncReq, T.ISetKnowledgeSyncRes>('/doc/knowledgeSync', data)
export const reindexDocApi = (data: T.IReindexDocReq) => post<T.IReindexDocReq, T.IReindexDocRes>('/doc/reindex', data)

// ==================== 权限 / 分享 permission ====================
export const setPermissionApi = (data: T.ISetPermissionReq) => post<T.ISetPermissionReq, T.ISetPermissionRes>('/perm/set', data)
export const deletePermissionApi = (data: T.IDeletePermissionReq) => post<T.IDeletePermissionReq, T.IDeletePermissionRes>('/perm/delete', data)
export const listPermissionsApi = (data: T.IListPermissionsReq) => post<T.IListPermissionsReq, T.IListPermissionsRes>('/perm/list', data)
export const checkPermissionApi = (data: T.ICheckPermissionReq) => post<T.ICheckPermissionReq, T.ICheckPermissionRes>('/perm/check', data)
export const listCollaboratorsApi = (data: T.IListCollaboratorsReq) => post<T.IListCollaboratorsReq, T.IListCollaboratorsRes>('/collab/list', data)

// ==================== 版本历史 revision ====================
export const listRevisionsApi = (data: T.IListRevisionsReq) => post<T.IListRevisionsReq, T.IListRevisionsRes>('/revision/list', data)
export const getRevisionApi = (data: T.IGetRevisionReq) => post<T.IGetRevisionReq, T.IGetRevisionRes>('/revision/get', data)
export const rollbackRevisionApi = (data: T.IRollbackRevisionReq) => post<T.IRollbackRevisionReq, T.IRollbackRevisionRes>('/revision/rollback', data)
export const labelRevisionApi = (data: T.ILabelRevisionReq) => post<T.ILabelRevisionReq, T.ILabelRevisionRes>('/revision/label', data)
export const diffRevisionsApi = (data: T.IDiffRevisionsReq) => post<T.IDiffRevisionsReq, T.IDiffRevisionsRes>('/revision/diff', data)

// ==================== 评论 / 批注 / @提及 ====================
export const createCommentApi = (data: T.ICreateCommentReq) => post<T.ICreateCommentReq, T.ICreateCommentRes>('/comment/create', data)
export const listCommentsApi = (data: T.IListCommentsReq) => post<T.IListCommentsReq, T.IListCommentsRes>('/comment/list', data)
export const resolveCommentApi = (data: T.IResolveCommentReq) => post<T.IResolveCommentReq, T.IResolveCommentRes>('/comment/resolve', data)
export const deleteCommentApi = (data: T.IDeleteCommentReq) => post<T.IDeleteCommentReq, T.IDeleteCommentRes>('/comment/delete', data)

// ==================== 分享链接 ====================
export const setShareLinkApi = (data: T.ISetShareLinkReq) => post<T.ISetShareLinkReq, T.ISetShareLinkRes>('/share/setLink', data)
export const getShareLinkApi = (data: T.IGetShareLinkReq) => post<T.IGetShareLinkReq, T.IGetShareLinkRes>('/share/getLink', data)
export const revokeShareLinkApi = (data: T.IRevokeShareLinkReq) => post<T.IRevokeShareLinkReq, T.IRevokeShareLinkRes>('/share/revokeLink', data)
export const resolveShareLinkApi = (data: T.IResolveShareLinkReq) => post<T.IResolveShareLinkReq, T.IResolveShareLinkRes>('/share/resolveLink', data)

// ==================== 回收站 ====================
export const listTrashApi = (data: T.IListTrashReq) => post<T.IListTrashReq, T.IListTrashRes>('/trash/list', data)
export const restoreTrashApi = (data: T.IRestoreTrashReq) => post<T.IRestoreTrashReq, T.IRestoreTrashRes>('/trash/restore', data)
export const purgeTrashApi = (data: T.IPurgeTrashReq) => post<T.IPurgeTrashReq, T.IPurgeTrashRes>('/trash/purge', data)
export const emptyTrashApi = (data: T.IEmptyTrashReq = {}) => post<T.IEmptyTrashReq, T.IEmptyTrashRes>('/trash/empty', data)

// ==================== 模板中心 ====================
export const listTemplatesApi = (data: T.IListTemplatesReq) => post<T.IListTemplatesReq, T.IListTemplatesRes>('/template/list', data)
export const createTemplateApi = (data: T.ICreateTemplateReq) => post<T.ICreateTemplateReq, T.ICreateTemplateRes>('/template/create', data)
export const instantiateTemplateApi = (data: T.IInstantiateTemplateReq) => post<T.IInstantiateTemplateReq, T.IInstantiateTemplateRes>('/template/instantiate', data)
export const deleteTemplateApi = (data: T.IDeleteTemplateReq) => post<T.IDeleteTemplateReq, T.IDeleteTemplateRes>('/template/delete', data)

// ==================== 富媒体块 ====================
export const saveDocBlockApi = (data: T.ISaveDocBlockReq) => post<T.ISaveDocBlockReq, T.ISaveDocBlockRes>('/block/save', data)
export const listDocBlocksApi = (data: T.IListDocBlocksReq) => post<T.IListDocBlocksReq, T.IListDocBlocksRes>('/block/list', data)
export const deleteDocBlockApi = (data: T.IDeleteDocBlockReq) => post<T.IDeleteDocBlockReq, T.IDeleteDocBlockRes>('/block/delete', data)

// ==================== 通知 / 审计 ====================
export const listNotificationsApi = (data: T.IListNotificationsReq) => post<T.IListNotificationsReq, T.IListNotificationsRes>('/notification/list', data)
export const markNotificationReadApi = (data: T.IMarkNotificationReadReq) => post<T.IMarkNotificationReadReq, T.IMarkNotificationReadRes>('/notification/read', data)
export const listAuditLogsApi = (data: T.IListAuditLogsReq) => post<T.IListAuditLogsReq, T.IListAuditLogsRes>('/audit/list', data)
