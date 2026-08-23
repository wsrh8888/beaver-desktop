/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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

  /**
   * 下载并打开本地文件
   */
  open(type: CacheType, fileKey: string): Promise<string | null>

}
