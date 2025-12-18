import logger from 'mainModule/utils/log'
import { ToolExecutionReceiver } from './tool-execution-receiver'
import { ToolListReceiver } from './tool-list-receiver'

/**
 * @description: MCP消息路由器
 * 根据消息类型路由到对应的接收器
 */
class MCPMessageRouter {
  private toolExecutionReceiver = new ToolExecutionReceiver()
  private toolListReceiver = new ToolListReceiver()

  /**
   * 处理MCP消息
   * @param wsMessage WebSocket 消息内容
   */
  async processMCPMessage(wsMessage: any) {
    const { data } = wsMessage

    if (!data?.type) {
      logger.warn({ text: 'MCP消息缺少 type 字段', data: { wsMessage } }, 'MCPMessageRouter')
      return
    }

    switch (data.type) {
      // 工具执行请求
      case 'tool_execution':
        await this.toolExecutionReceiver.handleTableUpdates(wsMessage.data.body)
        break

      // 工具列表注册请求
      case 'tool_list_register':
        await this.toolListReceiver.handleTableUpdates(wsMessage.data.body)
        break

      default:
        logger.warn({ text: '未知的MCP消息类型', data: { type: data.type } }, 'MCPMessageRouter')
    }
  }
}

// 导出单例实例
export const mcpMessageRouter = new MCPMessageRouter()
