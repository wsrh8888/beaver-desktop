// 群组同步状态服务请求和响应类型定义

/**
 * @description 批量获取指定模块的版本状态请求
 */
export interface DBGetModuleVersionsReq {
  module: string
  groupIds: string[]
}

/**
 * @description 批量获取指定模块的版本状态响应
 */
export interface DBGetModuleVersionsRes {
  versions: Array<{ groupId: string; version: number }>
}

/**
 * @description 更新指定模块的同步状态请求
 */
export interface DBUpsertSyncStatusReq {
  module: string
  groupId: string
  version: number
}
