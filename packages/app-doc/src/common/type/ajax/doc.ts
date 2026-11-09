/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 在线文档域类型契约（镜像 beaver-server app/doc/doc_api/doc.api）。
 * 命名：类型 I 前缀，请求 Req / 响应 Res 后缀。userId 由请求层注入 header，不入参。
 */

// ==================== 空间 space ====================
export interface ISpaceItem {
  spaceId: string
  name: string
  kind: string // owner | team | im
  ownerUserId: string
  parentId: string
  icon: string
  description: string
  status: number
  sort: number
  createdAt: string
}

export interface ICreateSpaceReq {
  name: string
  kind?: string
  parentId?: string
  icon?: string
  description?: string
  sort?: number
}
export interface ICreateSpaceRes {
  spaceId: string
}

export interface IUpdateSpaceReq {
  spaceId: string
  name?: string
  icon?: string
  description?: string
  parentId?: string
  status?: number
  sort?: number
}
export type IUpdateSpaceRes = Record<string, never>

export interface IDeleteSpaceReq {
  spaceId: string
}
export type IDeleteSpaceRes = Record<string, never>

export interface IGetSpaceReq {
  spaceId: string
}
export interface IGetSpaceRes {
  space?: ISpaceItem
}

export interface IListSpacesReq {
  status?: number
  page?: number
  pageSize?: number
}
export interface IListSpacesRes {
  total: number
  spaces: ISpaceItem[]
}

// ==================== 节点 node ====================
export interface INodeItem {
  nodeId: string
  spaceId: string
  parentId: string
  title: string
  icon: string
  type: string // page | folder
  sort: number
  docId: string
}

export interface ICreateNodeReq {
  spaceId: string
  parentId?: string
  title: string
  type?: string
  icon?: string
  sort?: number
}
export interface ICreateNodeRes {
  nodeId: string
  docId: string
}

export interface IUpdateNodeReq {
  nodeId: string
  title?: string
  icon?: string
  parentId?: string
  sort?: number
}
export type IUpdateNodeRes = Record<string, never>

export interface IDeleteNodeReq {
  nodeId: string
}
export type IDeleteNodeRes = Record<string, never>

export interface IListNodesReq {
  spaceId: string
}
export interface IListNodesRes {
  nodes: INodeItem[]
}

// ==================== 文档 document ====================
export interface IDocItem {
  docId: string
  nodeId: string
  spaceId: string
  title: string
  contentJson: string // ProseMirror 文档 JSON（快照）
  version: number
  ownerUserId: string
  lastEditedBy: string
  ragEnabled: boolean
  status: number
  updatedAt: string
  createdAt: string
}

export interface ICreateDocReq {
  spaceId: string
  nodeId?: string
  title: string
  contentJson?: string
  ragEnabled?: boolean
}
export interface ICreateDocRes {
  docId: string
}

export interface IGetDocReq {
  docId: string
}
export interface IGetDocRes {
  doc?: IDocItem
}

export interface IUpdateDocMetaReq {
  docId: string
  title?: string
  ragEnabled: boolean
  status?: number
}
export type IUpdateDocMetaRes = Record<string, never>

export interface IDeleteDocReq {
  docId: string
}
export type IDeleteDocRes = Record<string, never>

export interface ISaveDocContentReq {
  docId: string
  contentJson: string
  contentText?: string
}
export interface ISaveDocContentRes {
  version: number
}

// 初始快照拉取：Go 侧 []byte 在 JSON 中为 base64 字符串。
export interface IGetDocSyncStateReq {
  docId: string
}
export interface IGetDocSyncStateRes {
  snapshot: string
  updates: string[]
  version: number
}

// ==================== 权限 / 分享 permission ====================
export interface IPermItem {
  resourceType: string // space | doc
  resourceId: string
  principalType: string // user | group | dept
  principalId: string
  role: string // owner | manager | editor | commenter | viewer
}

export interface ISetPermissionReq {
  resourceType: string
  resourceId: string
  principalType?: string
  principalId: string
  role: string
}
export type ISetPermissionRes = Record<string, never>

export interface IDeletePermissionReq {
  resourceType: string
  resourceId: string
  principalType?: string
  principalId: string
}
export type IDeletePermissionRes = Record<string, never>

export interface IListPermissionsReq {
  resourceType: string
  resourceId: string
}
export interface IListPermissionsRes {
  permissions: IPermItem[]
}

export interface ICheckPermissionReq {
  resourceType: string
  resourceId: string
}
export interface ICheckPermissionRes {
  role: string
}

// ==================== 版本历史 revision ====================
export interface IRevisionItem {
  revisionId: string
  docId: string
  version: number
  title: string
  label: string
  createdBy: string
  createdAt: string
}

export interface IListRevisionsReq {
  docId: string
  page?: number
  pageSize?: number
}
export interface IListRevisionsRes {
  total: number
  revisions: IRevisionItem[]
}

export interface IGetRevisionReq {
  revisionId: string
}
export interface IGetRevisionRes {
  revision?: IRevisionItem
  contentJson: string
}

export interface IRollbackRevisionReq {
  docId: string
  revisionId: string
}
export interface IRollbackRevisionRes {
  version: number
}

// ==================== RAG 重索引 / 文件导入 ====================
export interface IReindexDocReq {
  docId: string
}
export interface IReindexDocRes {
  ok: boolean
  knowledgeDocId: string
}

export interface IImportDocReq {
  spaceId: string
  parentNodeId?: string
  title?: string
  fileName: string
  data: string // base64 编码的文件二进制
}
export interface IImportDocRes {
  docId: string
  nodeId: string
  contentText: string
  fileKind: string // docx | pdf | unsupported
  parsed: boolean
  message: string
}

// ==================== 协同 presence（awareness 派生，非后端端点） ====================
export interface IDocPresence {
  clientId: number
  name: string
  color: string
}
