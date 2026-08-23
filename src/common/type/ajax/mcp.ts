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
 * MCP 工具接口类型定义
 */

/**
 * MCP工具定义
 */
export interface MCPTool {
  name: string
  description: string
  inputSchema: any
  category?: string
  version?: string
}

/**
 * 注册工具请求
 */
export interface IRegisterToolReq {
  tools: Array<{
    clientId: string
    name: string
    description: string
    inputSchema: any
    category: string
    version: string
  }>
}

/**
 * 注册工具响应
 */
export interface IRegisterToolRes {
  success: boolean
  toolId: string
}

/**
 * 批量注册工具响应
 */
export interface IRegisterToolResult {
  tool: string
  success: boolean
  toolId?: string
  error?: string
}

/**
 * 获取客户端工具列表请求
 */
export interface IGetClientToolsReq {
  clientId: string
}

/**
 * 获取客户端工具列表响应
 */
export interface IGetClientToolsRes {
  success: boolean
  tools: MCPTool[]
}

/**
 * 执行工具请求
 */
export interface IExecuteToolReq {
  toolId: string
  action: string
  params: Record<string, any>
}

/**
 * 执行工具响应
 */
export interface IExecuteToolRes {
  success: boolean
  action: string
  result: any
}

/**
 * 批量注册工具结果
 */
export interface IRegisterToolResult {
  tool: string
  success: boolean
  toolId?: string
  error?: string
}

/**
 * 批量注册工具响应
 */
export interface IRegisterToolsRes {
  results: IRegisterToolResult[]
  successCount: number
  totalCount: number
}
