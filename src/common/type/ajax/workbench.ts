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

/** 打开方式：0 内嵌 WebView，1 系统浏览器 */
export type WorkbenchOpenMode = 0 | 1

/** 入口类型：0 路由 key，1 H5 地址 */
export type WorkbenchEntryType = 0 | 1

export interface IWorkbenchEntryConfig {
  type: WorkbenchEntryType
  pc?: string
  mobile?: string
}

export interface IWorkbenchAppItem {
  workbenchAppId: string
  name: string
  description: string
  icon: string
  /** 0 内部，1 第三方 H5 */
  appType: number
  /** 0 全部，1 仅 PC，2 仅移动 */
  clientScope: number
  entryConfig: IWorkbenchEntryConfig
  category: number
  sort: number
  openMode: WorkbenchOpenMode
}

export interface IWorkbenchAppGroup {
  category: number
  categoryName: string
  list: IWorkbenchAppItem[]
}

export interface IListWorkbenchAppsReq {
  /** 1 PC，2 移动 */
  clientScope?: number
}

export interface IListWorkbenchAppsRes {
  groups: IWorkbenchAppGroup[]
}

/** 解析当前端入口：优先本端，回退另一端 */
export function resolveWorkbenchEntry(
  app: IWorkbenchAppItem,
  client: 'pc' | 'mobile' = 'pc',
): string {
  const cfg = app.entryConfig
  if (!cfg)
    return ''
  const primary = client === 'pc' ? cfg.pc : cfg.mobile
  const fallback = client === 'pc' ? cfg.mobile : cfg.pc
  return (primary || fallback || '').trim()
}
