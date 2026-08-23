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

import type { ILogger } from 'commonModule/type/logger'

/**
 * @description: 日志模块接口
 */
export interface ILoggerModule {
  /**
   * 记录信息级别日志。
   * @param data - 日志数据，符合 ILogger 接口。
   * @param moduleName - (可选) 模块名称。
   */
  info(data: ILogger, moduleName: string): void
  /**
   * 记录错误级别日志。
   * @param data - 日志数据，符合 ILogger 接口。
   * @param moduleName - (可选) 模块名称。
   */
  error(data: ILogger, moduleName: string): void
  /**
   * 记录警告级别日志。
   * @param data - 日志数据，符合 ILogger 接口。
   * @param moduleName - (可选) 模块名称。
   */
  warn(data: ILogger, moduleName: string): void
}
