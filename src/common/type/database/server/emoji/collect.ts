// 表情收藏服务请求和响应类型定义

// ===== 表情收藏操作 =====

// 创建表情收藏请求
/**
 * @description 数据库服务请求
 */
export interface DBCreateEmojiCollectReq {
  collectData: any
}

// 创建表情收藏响应
/**
 * @description 数据库服务请求
 */
export interface DBCreateEmojiCollectRes {
  success: boolean
}

// 批量创建表情收藏请求
/**
 * @description 数据库服务请求
 */
export interface DBBatchCreateEmojiCollectReq {
  collectList: any[]
}

// 批量创建表情收藏响应
/**
 * @description 数据库服务请求
 */
export interface DBBatchCreateEmojiCollectRes {
  results: any[]
}

// 根据ID列表获取表情收藏请求
/**
 * @description 数据库服务请求
 */
export interface DBGetCollectsByIdsReq {
  ids: string[]
}

// 根据ID列表获取表情收藏响应
/**
 * @description 数据库服务请求
 */
export interface DBGetCollectsByIdsRes {
  collects: Map<string, any>
}

// 根据用户ID获取用户的所有表情收藏请求
/**
 * @description 数据库服务请求
 */
export interface DBGetCollectsByUserIdReq {
  userId: string
}

// 根据用户ID获取用户的所有表情收藏响应
/**
 * @description 数据库服务请求
 */
export interface DBGetCollectsByUserIdRes {
  collects: any[]
}

// 根据ID获取单个表情收藏请求
/**
 * @description 数据库服务请求
 */
export interface DBGetCollectByIdReq {
  collectId: string
}

// 根据ID获取单个表情收藏响应
/**
 * @description 数据库服务请求
 */
export interface DBGetCollectByIdRes {
  collect?: any | null
}

// 删除表情收藏请求
/**
 * @description 数据库服务请求
 */
export interface DBDeleteEmojiCollectReq {
  collectId: string
}

// 删除表情收藏响应
/**
 * @description 数据库服务请求
 */
export interface DBDeleteEmojiCollectRes {
  success: boolean
}
