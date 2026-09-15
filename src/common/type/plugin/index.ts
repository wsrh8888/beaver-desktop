/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 远程/可下载插件元信息 */
export interface IPluginInfo {
  /**
   * @description: 插件名称
   */
  name: string
  /**
   * @description: 插件描述
   */
  description: string
  /**
   * @description: 插件版本
   */
  version: string
  /**
   * @description: 插件下载地址
   */
  url: string
  /**
   * @description: 是否注入
   */
  inject: number
}

/** 能力包清单（宿主按名单加载，如 ai / circle / moment） */
export interface IPluginManifest {
  id: string
  name: string
  version: string
  description?: string
}
