/**
 * 健康检查处理器
 */
export class HealthHandler {
  /**
   * 处理健康检查请求
   */
  static handleHealthCheck(_req: any, res: any): void {
    res.json({ status: 'ok', server: 'MCP Server' })
  }
}
