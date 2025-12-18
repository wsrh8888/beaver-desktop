import { mcpManager } from 'mainModule/mcp-manager/index.js'
import { registerToolApi } from 'mainModule/api/mcp.js'
import logger from 'mainModule/utils/log/index.js'

/**
 * @description: MCP工具列表接收器 - 处理工具列表注册请求
 */
class ToolListReceiver {
  /**
   * 处理工具列表注册请求
   * 只处理 messages 表的更新（遵循项目模式）
   */
  async handleTableUpdates(tableUpdatesBody: any) {
    const { requestId, clientId } = tableUpdatesBody

    logger.info({
      text: `注册MCP工具列表`,
      data: { requestId, clientId }
    })

    // 获取本地所有工具
    const tools = mcpManager.getAllTools()

    // 通过HTTP API注册工具列表到云端
    try {
      await registerToolApi({ tools })
      logger.info({
        text: `工具列表已注册到云端`,
        data: { requestId, clientId, toolCount: tools.length }
      })
    } catch (error) {
      logger.error({
        text: `注册工具列表到云端失败`,
        error
      })
    }
  }
}

export default new ToolListReceiver()