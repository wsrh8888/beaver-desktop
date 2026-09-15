/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IStore, IStoreOptions } from '../../common/type/mainStore'
import { getMainRuntime } from '../bind'

/**
 * 主进程 store 门面（对齐原 mainModule/store）
 * 真实 electron-store 在宿主，经 bindMain 注入。
 */
export const store = {
  get(key: string) {
    return getMainRuntime().store.get(key)
  },
  set(key: string, value: unknown, options?: IStoreOptions) {
    getMainRuntime().store.set(key, value, options)
  },
  delete(key: string, options?: IStoreOptions) {
    getMainRuntime().store.delete(key, options)
  },
} as IStore
