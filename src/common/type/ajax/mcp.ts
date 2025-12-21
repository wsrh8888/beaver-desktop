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
