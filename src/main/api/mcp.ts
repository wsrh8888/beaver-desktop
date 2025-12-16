import type {
  IRegisterToolReq,
  IRegisterToolResult,
  IGetClientToolsReq,
  IGetClientToolsRes
} from 'commonModule/type/ajax/mcp'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 注册工具到云端MCP服务器
 */
export const registerToolApi = (data: IRegisterToolReq) => {
  return ajax<IRegisterToolResult[]>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/mcp/register`,
  })
}

/**
 * @description: 获取客户端工具列表
 */
export const getClientToolsApi = (data: IGetClientToolsReq) => {
  return ajax<IGetClientToolsRes>({
    method: 'GET',
    url: `${getBaseUrl()}/api/mcp/client/${data.clientId}/tools`,
  })
}
