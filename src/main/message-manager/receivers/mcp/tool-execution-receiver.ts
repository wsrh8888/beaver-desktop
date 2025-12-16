import { mcpManager } from 'mainModule/mcp-manager/index.js'
import logger from 'mainModule/utils/log/index.js'

/**
 * @description: MCP工具执行接收器 - 处理云端转发过来的工具执行请求
 */
export class ToolExecutionReceiver {
  /**
   * 处理工具执行请求
   * 只处理 messages 表的更新（遵循项目模式）
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { toolName, params, requestId, clientId } = tableUpdatesBody

    logger.info({
      text: `执行MCP工具`,
      data: { toolName, requestId, clientId }
    })

    // 执行工具
    await mcpManager.executeTool(toolName, params)
  }
}
