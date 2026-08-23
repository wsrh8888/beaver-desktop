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
 * @description: 下载更新参数接口
 */
export interface IDownloadOptions {
  fileUrl: string
  md5: string
  version: string
}

/**
 * @description: 升级模块接口
 */
export interface IUpdateModule {
  /**
   * @description: 保存之前的监听器引用
   */
  previousHandler: any
  /**
   * 下载更新，传入下载参数对象和进度回调函数。
   * @param options - 下载参数对象
   * @param onProgress - 进度回调函数，参数为下载进度(0-100)
   */
  downloadUpdate(options: IDownloadOptions, onProgress: (progress: number) => void): void
  /**
   * 触发升级。
   */
  startUpdate(options: IDownloadOptions): void
}
