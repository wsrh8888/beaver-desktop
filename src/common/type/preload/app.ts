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
 * @description: 托盘菜单项
 */
export interface TrayMenuItem {
  id: string

  /**
   * @description: 菜单项标签/标题
   */
  label: string
  /**
   * @description: 未读数量
   */
  count?: number

  /**
   * @description: 类型，这个通知是什么类型的通知， 是聊天消息通知，还是系统消息通知，还是其他通知
   */
  type: 'chat' | 'system' | 'other'
}

/**
 * @description: 应用信息模块接口
 */
export interface IAppModule {
  /**
   * @description: Electron 及 Node.js 等相关依赖的版本信息。
   */
  versions: NodeJS.ProcessVersions
  /**
   * @description: 应用的根路径。
   */
  rootPath: string
  /**
   * @description: 应用的 token。
   */
  token: string | undefined
  /**
   * @description: 应用的设备唯一标识。
   */
  devicedId: string | undefined
  /**
   * 环境变量，例如 测试或生产环境。
   * @example 'test', 'prod'
   */
  env: 'prod' | 'test' | 'dev'

  /**
   * @description: 应用的版本。
   */
  version: string
}
