/**
 * @description: 缓存类型枚举 - 基于开源IM项目分析
 */
export enum CacheType {
  USER_AVATAR = 'user_avatar',
  USER_DB = 'user_db',
  USER_LOGS = 'user_logs',
  PUBLIC_LOGS = 'public_logs',
  PUBLIC_UPDATE = 'public_update',
}

/**
 * @description: 缓存信息接口
 */
export interface ICacheInfo {
  /** 文件名 */
  fileName: string
  /** 过期时间戳 */
  expireTime: number
  /** 文件大小 */
  size?: number
  /** MD5值 */
  md5?: string
}
