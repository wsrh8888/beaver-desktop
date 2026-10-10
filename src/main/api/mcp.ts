/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IReportCapabilitiesReq, IReportCapabilitiesRes, ISubmitHostResultReq } from 'commonModule/type/mcp'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * 上报客户端能力清单（builtin + 用户配的 MCP server 聚合）。
 * deviceId / token 由 ajax 拦截器（getCommonParams）随每个请求 header 带上，
 * 服务端 report_capabilities 读 deviceId header，无需此处显式传。
 */
export const reportCapabilitiesApi = (data: IReportCapabilitiesReq) => {
  return ajax<IReportCapabilitiesRes>({
    method: 'POST',
    url: `${getBaseUrl()}/api/agent/v1/message/reportCapabilities`,
    data,
  })
}

/**
 * 本机工具执行完，把结果交回正在等待的 sendMessage。
 */
export const submitHostResultApi = (data: ISubmitHostResultReq) => {
  return ajax({
    method: 'POST',
    url: `${getBaseUrl()}/api/agent/v1/message/submitHostResult`,
    data,
  })
}
