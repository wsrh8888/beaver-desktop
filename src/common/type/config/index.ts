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

export interface DatabaseConfig {
  path: string
  pragmas: {
    journal_mode: string
    synchronous: string
    busy_timeout: string
    cache_size: string
  }
}

export interface IConfig {
  baseUrl: string
  openAppId: string
  env: string
  /** 原始日志 Bucket，对应 log */
  logId: string
}

export interface IConfigs {
  [key: string]: IConfig
}

export interface IElectronApp {
  env: string
  /** 可选，来自 config.ini 的 API 域名覆盖 */
  baseUrl?: string
}

export interface IElectron {
  app: IElectronApp
}

export interface IMiniApp {
  env: string
}
