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

import { messagingTools } from './tools/messaging/index.js'
import { socialTools } from './tools/social/index.js'
import { groupTools } from './tools/group/index.js'
import { searchTools } from './tools/search/index.js'
import { systemTools } from './tools/system/index.js'
import { windowTools } from './tools/window/index.js'
import { momentTools } from './tools/moment/index.js'

import { localMCPServer } from './server/index.js'
import type { MCPTool as IMCPTool } from 'commonModule/type/ajax/mcp'
import { registerToolApi } from 'mainModule/api/mcp.js'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('MCPManager')

/**
 * MCP工具接口（扩展API类型，添加handler）
 */
export interface MCPTool extends IMCPTool {
  handler: (params: any) => Promise<any>
}

/**
 * MCP Manager - MCP系统统一入口
 */
class MCPManager {
  private tools: MCPTool[] = []

  constructor() {
    this.tools = [
      ...messagingTools,
      ...socialTools,
      ...groupTools,
      ...searchTools,
      ...systemTools,
      ...windowTools,
      ...momentTools,
    ]
  }

  /**
   * 初始化MCP系统
   */
  async init() {
    try {
      logger.info({ text: '开始初始化 MCP 系统', data: { toolCount: this.tools.length } })

      // 启动本地MCP服务器
      await localMCPServer.start(9518)
      logger.info({ text: '本地 MCP 服务器启动成功', data: { port: 9518 } })

      // 注册工具到云端
      await this.registerToolsToCloud()
      logger.info({ text: 'MCP 工具注册到云端完成', data: { toolCount: this.tools.length } })
    }
    catch (error) {
      logger.error({ text: 'MCP 系统初始化失败', data: { error: (error as Error)?.message } })
      throw error
    }
  }

  /**
   * 注册工具到云端
   */
  private async registerToolsToCloud() {
    const clientId = process.custom.DEVICE_ID
    logger.info({ text: '开始注册 MCP 工具到云端', data: { toolCount: this.tools.length } })

    const toolRequests = this.tools.map(tool => ({
      clientId,
      name: tool.name,
      description: tool.description,
      inputSchema: tool.inputSchema,
      category: tool.name.split('_')[0],
      version: '1.0',
    }))

    await registerToolApi({ tools: toolRequests })
  }

  /**
   * 获取所有MCP工具定义
   */
  getAllTools(): MCPTool[] {
    return this.tools
  }

  /**
   * 执行工具（供服务器调用）
   */
  async executeTool(toolName: string, params: any) {
    const tool = this.tools.find(t => t.name === toolName)

    if (!tool) {
      logger.warn({ text: '未找到指定的 MCP 工具', data: { toolName } })
      throw new Error(`Tool '${toolName}' not found`)
    }

    logger.info({ text: '开始执行 MCP 工具', data: { toolName } })
    const result = await tool.handler(params)
    logger.info({ text: 'MCP 工具执行完成', data: { toolName } })

    return {
      content: [
        {
          type: 'text' as const,
          text: JSON.stringify(result, null, 2),
        },
      ],
    }
  }
}

// 导出单例实例
export const mcpManager = new MCPManager()
