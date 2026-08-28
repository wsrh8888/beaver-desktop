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

/** Electron app.getPath 常用名，另含应用安装/开发根目录 root（对应 getRootPath） */
export type FsSystemPathName =
  | 'home'
  | 'appData'
  | 'userData'
  | 'sessionData'
  | 'temp'
  | 'exe'
  | 'module'
  | 'desktop'
  | 'documents'
  | 'downloads'
  | 'music'
  | 'pictures'
  | 'videos'
  | 'recent'
  | 'logs'
  | 'crashDumps'
  | 'root'

export interface IFsMkdirResult {
  success: boolean
  path?: string
  error?: string
}

export interface IFsOpenDirectoryResult {
  path: string
  name: string
}

/**
 * @description: 通用文件系统模块（不承载业务语义）
 */
export interface IFsModule {
  mkdir: (dirPath: string) => Promise<IFsMkdirResult>
  exists: (targetPath: string) => Promise<boolean>
  getPath: (name: FsSystemPathName) => Promise<string>
  join: (...parts: string[]) => Promise<string>
  basename: (targetPath: string) => Promise<string>
  showOpenDirectory: (options?: {
    title?: string
    defaultPath?: string
  }) => Promise<IFsOpenDirectoryResult | null>
}
