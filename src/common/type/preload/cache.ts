/**
 * @description: 缓存模块接口 - 基于开源IM项目设计
 */

import type { CacheType } from '../cache/cache'

/**
 * 缓存选项
 */
export interface ICacheOptions {
  /** 过期时间（毫秒），默认7天 */
  expireTime?: number
}

/**
 * 缓存模块接口 - 清晰的方法分离
 */
export interface ICacheModule {
  /**
   * 获取缓存内容
   * @param type - 缓存类型
   * @param key - 缓存键
   * @returns Promise<any> - 返回缓存内容，不存在返回null
   */
  get(type: CacheType, fileKey: string): Promise<string>

  /**
   * 设置缓存内容
   * @param type - 缓存类型
   * @param fileKey - 缓存键
   * @param data - 要缓存的数据
   * @param options - 缓存选项（可选）
   * @returns Promise<any> - 返回操作结果
   */
  set(type: CacheType, fileKey: string, data: any, options?: ICacheOptions): Promise<any>

}
