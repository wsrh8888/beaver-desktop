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

import type { IMcpServerManifest } from './manifest'

/**
 * 上报客户端能力清单。
 * deviceId / token 由 ajax 拦截器随每个请求 header 带上，
 * 服务端从 deviceId header 读取，这里不传。
 */
export interface IReportCapabilitiesReq {
  source: 'client' | 'service'
  conversationId?: string
  servers: IMcpServerManifest[]
}

/** reportCapabilities 响应。 */
export interface IReportCapabilitiesRes {
  accepted: boolean
  toolCount: number
}
