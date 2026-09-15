/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 插件可见的 store 契约（子集）。
 * 宿主完整 IStoreDataMap 仍在 src/common；此处只暴露能力包会用到的面。
 */
export interface IStoreOptions {
  persist?: boolean
}

export interface IStoreUserInfo {
  token?: string
  userId?: string
}

export interface IStore {
  get(key: 'userInfo'): IStoreUserInfo | undefined
  get(key: string): unknown
  set(key: string, value: unknown, options?: IStoreOptions): void
  delete(key: string, options?: IStoreOptions): void
}
