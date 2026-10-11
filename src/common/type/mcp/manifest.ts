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
 * 客户端聚合 tools/list 后上报给服务端的能力清单。
 * 对齐服务端 McpToolSchema / McpServerManifest。
 */

/** 一个 MCP 工具的 schema。inputSchema 是 JSON Schema，描述工具入参。 */
export interface IMcpToolSchema {
  name: string
  description: string
  /** JSON Schema 对象，描述工具入参。允许任意字段，服务端不校验 schema 本身。 */
  inputSchema: Record<string, any>
  /**
   * 是否需要用户在 AI 聊天框确认后再执行。
   * true = 调用前按 schema 渲染确认卡片，用户确认或编辑参数后才执行。
   * false（默认）= 直接执行。
   * 工具声明方按操作性质设置：只读、幂等为 false，有副作用的创作为 true。
   */
  requiresConfirm?: boolean
}

/** 一个 MCP server 的能力清单。transport 决定服务端执行路径。 */
export interface IMcpServerManifest {
  name: string
  version: string
  /**
   * transport: 执行路径。
   *   "client" = 客户端本机执行，走 client_tool 事件下发
   *   "service" = 微服务执行，走 call_go_tool 转 Go
   */
  transport: 'client' | 'service'
  tools: IMcpToolSchema[]
}
