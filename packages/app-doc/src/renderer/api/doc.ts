/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  ICheckPermissionReq,
  ICheckPermissionRes,
  ICreateDocReq,
  ICreateDocRes,
  ICreateNodeReq,
  ICreateNodeRes,
  ICreateSpaceReq,
  ICreateSpaceRes,
  IDeleteDocReq,
  IDeleteDocRes,
  IDeleteNodeReq,
  IDeleteNodeRes,
  IDeletePermissionReq,
  IDeletePermissionRes,
  IDeleteSpaceReq,
  IDeleteSpaceRes,
  IGetDocReq,
  IGetDocRes,
  IGetDocSyncStateReq,
  IGetDocSyncStateRes,
  IGetRevisionReq,
  IGetRevisionRes,
  IGetSpaceReq,
  IGetSpaceRes,
  IImportDocReq,
  IImportDocRes,
  IListNodesReq,
  IListNodesRes,
  IListPermissionsReq,
  IListPermissionsRes,
  IListRevisionsReq,
  IListRevisionsRes,
  IListSpacesReq,
  IListSpacesRes,
  IReindexDocReq,
  IReindexDocRes,
  IRollbackRevisionReq,
  IRollbackRevisionRes,
  ISaveDocContentReq,
  ISaveDocContentRes,
  ISetPermissionReq,
  ISetPermissionRes,
  IUpdateDocMetaReq,
  IUpdateDocMetaRes,
  IUpdateNodeReq,
  IUpdateNodeRes,
  IUpdateSpaceReq,
  IUpdateSpaceRes,
} from '@packageCommon/type/ajax/doc'
import { ajax, getBaseUrl } from '@beaver-im/beaver/renderer'

const base = () => `${getBaseUrl()}/api/doc/v1`

// ==================== 空间 space ====================
export const createSpaceApi = (data: ICreateSpaceReq) =>
  ajax<ICreateSpaceRes>({ method: 'POST', data, url: `${base()}/space/create` })

export const updateSpaceApi = (data: IUpdateSpaceReq) =>
  ajax<IUpdateSpaceRes>({ method: 'POST', data, url: `${base()}/space/update` })

export const deleteSpaceApi = (data: IDeleteSpaceReq) =>
  ajax<IDeleteSpaceRes>({ method: 'POST', data, url: `${base()}/space/delete` })

export const getSpaceApi = (data: IGetSpaceReq) =>
  ajax<IGetSpaceRes>({ method: 'POST', data, url: `${base()}/space/get` })

export const listSpacesApi = (data: IListSpacesReq) =>
  ajax<IListSpacesRes>({ method: 'POST', data, url: `${base()}/space/list` })

// ==================== 节点 node ====================
export const createNodeApi = (data: ICreateNodeReq) =>
  ajax<ICreateNodeRes>({ method: 'POST', data, url: `${base()}/node/create` })

export const updateNodeApi = (data: IUpdateNodeReq) =>
  ajax<IUpdateNodeRes>({ method: 'POST', data, url: `${base()}/node/update` })

export const deleteNodeApi = (data: IDeleteNodeReq) =>
  ajax<IDeleteNodeRes>({ method: 'POST', data, url: `${base()}/node/delete` })

export const listNodesApi = (data: IListNodesReq) =>
  ajax<IListNodesRes>({ method: 'POST', data, url: `${base()}/node/list` })

// ==================== 文档 document ====================
export const createDocApi = (data: ICreateDocReq) =>
  ajax<ICreateDocRes>({ method: 'POST', data, url: `${base()}/doc/create` })

export const getDocApi = (data: IGetDocReq) =>
  ajax<IGetDocRes>({ method: 'POST', data, url: `${base()}/doc/get` })

export const updateDocMetaApi = (data: IUpdateDocMetaReq) =>
  ajax<IUpdateDocMetaRes>({ method: 'POST', data, url: `${base()}/doc/updateMeta` })

export const deleteDocApi = (data: IDeleteDocReq) =>
  ajax<IDeleteDocRes>({ method: 'POST', data, url: `${base()}/doc/delete` })

export const saveDocContentApi = (data: ISaveDocContentReq) =>
  ajax<ISaveDocContentRes>({ method: 'POST', data, url: `${base()}/doc/saveContent` })

export const getDocSyncStateApi = (data: IGetDocSyncStateReq) =>
  ajax<IGetDocSyncStateRes>({ method: 'POST', data, url: `${base()}/doc/syncState` })

export const reindexDocApi = (data: IReindexDocReq) =>
  ajax<IReindexDocRes>({ method: 'POST', data, url: `${base()}/doc/reindex` })

export const importDocApi = (data: IImportDocReq) =>
  ajax<IImportDocRes>({ method: 'POST', data, url: `${base()}/doc/import` })

// ==================== 权限 / 分享 permission ====================
export const setPermissionApi = (data: ISetPermissionReq) =>
  ajax<ISetPermissionRes>({ method: 'POST', data, url: `${base()}/perm/set` })

export const deletePermissionApi = (data: IDeletePermissionReq) =>
  ajax<IDeletePermissionRes>({ method: 'POST', data, url: `${base()}/perm/delete` })

export const listPermissionsApi = (data: IListPermissionsReq) =>
  ajax<IListPermissionsRes>({ method: 'POST', data, url: `${base()}/perm/list` })

export const checkPermissionApi = (data: ICheckPermissionReq) =>
  ajax<ICheckPermissionRes>({ method: 'POST', data, url: `${base()}/perm/check` })

// ==================== 版本历史 revision ====================
export const listRevisionsApi = (data: IListRevisionsReq) =>
  ajax<IListRevisionsRes>({ method: 'POST', data, url: `${base()}/revision/list` })

export const getRevisionApi = (data: IGetRevisionReq) =>
  ajax<IGetRevisionRes>({ method: 'POST', data, url: `${base()}/revision/get` })

export const rollbackRevisionApi = (data: IRollbackRevisionReq) =>
  ajax<IRollbackRevisionRes>({ method: 'POST', data, url: `${base()}/revision/rollback` })
