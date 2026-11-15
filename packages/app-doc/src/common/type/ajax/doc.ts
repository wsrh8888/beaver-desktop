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
 * 空响应用 IEmptyRes；Go 侧 []byte / [][]byte 在 JSON 中为 base64 字符串。
 */

export type IEmptyRes = Record<string, never>

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
export type IUpdateSpaceRes = IEmptyRes

export interface IDeleteSpaceReq {
  spaceId: string
}
export type IDeleteSpaceRes = IEmptyRes

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
export type IUpdateNodeRes = IEmptyRes

export interface IDeleteNodeReq {
  nodeId: string
}
export type IDeleteNodeRes = IEmptyRes

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
  contentText: string // 服务端派生的纯文本，用于列表预览 / 搜索摘要
  version: number
  epoch: number // 协同纪元；版本回滚后递增，客户端须重建 provider
  docType: string // doc | sheet | board | ...
  icon: string
  cover: string
  ragEnabled: boolean
  ownerUserId: string
  lastEditedBy: string
  status: number
  updatedAt: string
  createdAt: string
}

export interface ICreateDocReq {
  spaceId: string
  nodeId?: string
  title: string
  contentJson?: string
  docType?: string
  icon?: string
  cover?: string
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
  status?: number
  icon?: string
  cover?: string
  docType?: string
  /** 显式开关位：布尔 false 也需要该标记为 true 才会下发 */
  ragEnabled?: boolean
  ragEnabledSet?: boolean
}
export type IUpdateDocMetaRes = IEmptyRes

export interface IDeleteDocReq {
  docId: string
}
export type IDeleteDocRes = IEmptyRes

export interface ISaveDocContentReq {
  docId: string
  contentJson: string
  contentText?: string
}
export interface ISaveDocContentRes {
  version: number
}

/** 初始快照拉取：编辑器首次连接、离线恢复或降级为纯 HTTP 模式时的全量入口。 */
export interface IGetDocSyncStateReq {
  docId: string
  epoch?: number
}
export interface IGetDocSyncStateRes {
  snapshot: string // base64(V1 update)
  updates: string[] // base64(V1 update)[]
  version: number
  epoch: number
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
export type ISetPermissionRes = IEmptyRes

export interface IDeletePermissionReq {
  resourceType: string
  resourceId: string
  principalType?: string
  principalId: string
}
export type IDeletePermissionRes = IEmptyRes

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
  /** 新纪元：调用方必须据此销毁旧 Y.Doc / provider 并重新建连 */
  epoch: number
}

// ==================== 文件导入 ====================
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

// ==================== 实时协同 WebSocket ====================
/** docId@epoch 房间名由服务端权威生成；客户端只传自己缓存的 epoch 供过期判定。 */
export interface IWsParams {
  docId: string
  userId: string
  token: string
  platform?: string
  deviceId?: string
  epoch?: number
  room?: string
}

// ==================== 评论 / 批注 / @提及 ====================
export interface ICommentItem {
  commentId: string
  docId: string
  epoch: number
  parentId: string
  anchorId: string
  quote: string
  content: string
  mentions: string // 逗号分隔的 userId
  createdBy: string
  resolved: boolean
  resolvedBy: string
  resolvedAt: string
  createdAt: string
  replies: ICommentItem[]
}

export interface ICreateCommentReq {
  docId: string
  parentId?: string
  anchorId?: string
  quote?: string
  content: string
  mentions?: string
}
export interface ICreateCommentRes {
  comment?: ICommentItem
}

export interface IListCommentsReq {
  docId: string
  includeResolved?: boolean
}
export interface IListCommentsRes {
  total: number
  comments: ICommentItem[]
}

export interface IResolveCommentReq {
  commentId: string
  resolved: boolean
}
export type IResolveCommentRes = IEmptyRes

export interface IDeleteCommentReq {
  commentId: string
}
export type IDeleteCommentRes = IEmptyRes

// ==================== 分享链接 ====================
export interface IShareLinkItem {
  linkId: string
  token: string
  resourceType: string
  resourceId: string
  scope: string // anyone | org | invited
  role: string // viewer | commenter | editor
  hasPassword: boolean
  expiresAt: string
  allowDownload: boolean
  allowCopy: boolean
  allowComment: boolean
  watermark: boolean
  viewCount: number
  createdBy: string
  status: number
  url: string
}

export interface ISetShareLinkReq {
  resourceType: string
  resourceId: string
  scope?: string
  role?: string
  password?: string
  expiresAt?: string
  allowDownload?: boolean
  allowCopy?: boolean
  allowComment?: boolean
  watermark?: boolean
}
export interface ISetShareLinkRes {
  link?: IShareLinkItem
}

export interface IGetShareLinkReq {
  resourceType: string
  resourceId: string
}
export interface IGetShareLinkRes {
  link?: IShareLinkItem
}

export interface IRevokeShareLinkReq {
  linkId: string
}
export type IRevokeShareLinkRes = IEmptyRes

export interface IResolveShareLinkReq {
  token: string
  password?: string
}
export interface IResolveShareLinkRes {
  resourceType: string
  resourceId: string
  role: string
  docId: string
  title: string
  allowDownload: boolean
  allowCopy: boolean
  allowComment: boolean
  watermark: boolean
}

// ==================== 回收站 ====================
export interface ITrashItem {
  trashId: string
  resourceType: string // doc | node | space
  resourceId: string
  title: string
  spaceId: string
  parentId: string
  deletedBy: string
  deletedAt: string
}

export interface IListTrashReq {
  page?: number
  pageSize?: number
}
export interface IListTrashRes {
  total: number
  items: ITrashItem[]
}

export interface IRestoreTrashReq {
  trashId: string
}
export interface IRestoreTrashRes {
  resourceType: string
  resourceId: string
}

export interface IPurgeTrashReq {
  trashId: string
}
export type IPurgeTrashRes = IEmptyRes

export interface IEmptyTrashReq {}
export interface IEmptyTrashRes {
  purged: number
}

// ==================== 检索 / 列表 / 最近 / 收藏 ====================
export interface IDocSearchItem {
  doc?: IDocItem
  snippet: string
}

export interface ISearchDocsReq {
  query: string
  spaceId?: string
  docType?: string
  page?: number
  pageSize?: number
}
export interface ISearchDocsRes {
  total: number
  items: IDocSearchItem[]
}

export interface IListDocsReq {
  spaceId: string
  docType?: string
  page?: number
  pageSize?: number
}
export interface IListDocsRes {
  total: number
  docs: IDocItem[]
}

export interface IRecordVisitReq {
  docId: string
}
export type IRecordVisitRes = IEmptyRes

export interface IListRecentReq {
  page?: number
  pageSize?: number
}
export interface IListRecentRes {
  total: number
  docs: IDocItem[]
}

export interface ISetFavoriteReq {
  docId: string
  favorite: boolean
}
export interface ISetFavoriteRes {
  favorite: boolean
}

export interface IListFavoritesReq {
  page?: number
  pageSize?: number
}
export interface IListFavoritesRes {
  total: number
  docs: IDocItem[]
}

// ==================== 模板中心 ====================
export interface ITemplateItem {
  templateId: string
  name: string
  category: string
  description: string
  cover: string
  contentJson: string
  docType: string
  scope: string // system | owner
  ownerUserId: string
  useCount: number
  status: number
  createdAt: string
}

export interface IListTemplatesReq {
  category?: string
  page?: number
  pageSize?: number
}
export interface IListTemplatesRes {
  total: number
  templates: ITemplateItem[]
}

export interface ICreateTemplateReq {
  name: string
  category?: string
  description?: string
  cover?: string
  contentJson?: string
  docType?: string
  scope?: string
}
export interface ICreateTemplateRes {
  templateId: string
}

export interface IInstantiateTemplateReq {
  templateId: string
  spaceId: string
  parentNodeId?: string
  title?: string
}
export interface IInstantiateTemplateRes {
  docId: string
  nodeId: string
}

export interface IDeleteTemplateReq {
  templateId: string
}
export type IDeleteTemplateRes = IEmptyRes

// ==================== 导出 / 复制 ====================
export interface IExportDocReq {
  docId: string
  format?: 'md' | 'html' | 'txt' | 'json' | 'docx'
}
export interface IExportDocRes {
  fileName: string
  mimeType: string
  data: string // docx 为 base64，其余格式同时也放在 text 中
  text: string
}

export interface IDuplicateDocReq {
  docId: string
  spaceId?: string
  parentNodeId?: string
  title?: string
}
export interface IDuplicateDocRes {
  docId: string
  nodeId: string
}

// ==================== 富媒体块（多维表格 / 画板，独立于 ProseMirror 树） ====================
export interface IDocBlockItem {
  blockId: string
  docId: string
  kind: string // sheet | board | ...
  title: string
  payloadJson: string
  version: number
  updatedBy: string
  updatedAt: string
}

export interface ISaveDocBlockReq {
  docId: string
  blockId?: string
  kind: string
  title?: string
  payloadJson: string
}
export interface ISaveDocBlockRes {
  block?: IDocBlockItem
}

export interface IListDocBlocksReq {
  docId: string
}
export interface IListDocBlocksRes {
  blocks: IDocBlockItem[]
}

export interface IDeleteDocBlockReq {
  docId: string
  blockId: string
}
export type IDeleteDocBlockRes = IEmptyRes

// ==================== 版本增强 ====================
export interface ILabelRevisionReq {
  revisionId: string
  label: string
}
export type ILabelRevisionRes = IEmptyRes

export interface IDiffRevisionsReq {
  docId: string
  baseRevisionId: string
  targetRevisionId: string
}
export interface IDiffRevisionsRes {
  baseContentJson: string
  targetContentJson: string
  baseText: string
  targetText: string
  addedLines: string[]
  removedLines: string[]
}

// ==================== 通知中心 ====================
export interface INotificationItem {
  notificationId: string
  userId: string
  docId: string
  kind: string // comment | mention | reply | share | rollback | ...
  actorUserId: string
  title: string
  excerpt: string
  isRead: boolean
  createdAt: string
}

export interface IListNotificationsReq {
  unreadOnly?: boolean
  page?: number
  pageSize?: number
}
export interface IListNotificationsRes {
  total: number
  unread: number
  items: INotificationItem[]
}

export interface IMarkNotificationReadReq {
  notificationId?: string
  all?: boolean
}
export interface IMarkNotificationReadRes {
  unread: number
}

// ==================== 操作审计 ====================
export interface IAuditLogItem {
  logId: string
  actorUserId: string
  action: string
  resourceType: string
  resourceId: string
  detail: string
  createdAt: string
}

export interface IListAuditLogsReq {
  actorUserId?: string
  action?: string
  resourceType?: string
  resourceId?: string
  page?: number
  pageSize?: number
}
export interface IListAuditLogsRes {
  total: number
  logs: IAuditLogItem[]
}

// ==================== 知识库同步 / 协作者 ====================
export interface ISetKnowledgeSyncReq {
  docId: string
  ragEnabled: boolean
}
export interface ISetKnowledgeSyncRes {
  ragEnabled: boolean
}

export interface IReindexDocReq {
  docId: string
}
export interface IReindexDocRes {
  version: number
  status: string // pending
  digest: string
}

export interface ICollaboratorItem {
  userId: string
  role: string
  principalType: string
  source: string // owner | space_owner | doc_permission | space_permission
}

export interface IListCollaboratorsReq {
  docId: string
}
export interface IListCollaboratorsRes {
  collaborators: ICollaboratorItem[]
}

// ==================== 协同 presence（awareness 派生，非后端端点） ====================
export interface IDocPresence {
  clientId: number
  userId: string
  name: string
  color: string
  cursor?: { anchor: string, head: string }
  /** 该协作者当前是否处于只读（viewer / commenter）态，由 awareness 广播。 */
  readOnly?: boolean
}
