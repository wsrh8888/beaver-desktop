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

/**
 * MCP工具接口（扩展API类型，添加handler）
 */
export interface MCPTool extends IMCPTool {
  handler: (params: any) => Promise<any>
}

/**
 * MCP Manager - MCP系统统一入口
 */
export class MCPManager {
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
    // 启动本地MCP服务器
    await localMCPServer.start(9518)

    // 注册工具到云端
    await this.registerToolsToCloud()
  }

  /**
   * 注册工具到云端
   */
  private async registerToolsToCloud() {
    const clientId = process.custom.DEVICE_ID

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
      throw new Error(`Tool '${toolName}' not found`)
    }

    const result = await tool.handler(params)

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
