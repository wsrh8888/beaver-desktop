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

export interface IStoreOptions {
  /**
   * 是否持久化到文件，默认 false（内存存储）
   */
  persist?: boolean
}

// Store 接口定义
export interface IStore {
  get<T extends keyof StoreDataMap>(key: IStoreKey<T>): IStoreValue<T> | undefined
  set<T extends keyof StoreDataMap>(key: IStoreKey<T>, value: IStoreValue<T>, options?: IStoreOptions): void
  delete(key: string, options?: IStoreOptions): void
}

// 当前存储的数据类型
export interface StoreDataMap {
  userInfo: {
    token?: string
    userId?: string
  }
}

// 获取存储键对应的类型
export type IStoreKey<T extends keyof StoreDataMap> = T
export type IStoreValue<T extends keyof StoreDataMap> = StoreDataMap[T]
