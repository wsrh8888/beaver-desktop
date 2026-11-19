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

import type {
  IListAgentMessagesReq,
  IListAgentMessagesRes,
  IListAgentTopicsReq,
  IListAgentTopicsRes,
  ISendAgentMessageReq,
  ISendAgentMessageRes,
} from 'commonModule/type/ajax/agent'
import type { ISubmitClientToolResultReq } from 'commonModule/type/mcp/clientTool'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'
import Logger from 'renderModule/utils/logger'
const logger = new Logger('agent')

/**
 * @description: 发消息给 Agent（HTTP 只返回 accepted；增量经 IM ws 推）
 */
export const sendAgentMessageApi = (data: ISendAgentMessageReq) => {
  logger.info({ text: 'sendAgentMessageApi 开始' })
  return ajax<ISendAgentMessageRes>({
    method: 'POST',
    url: `${baseUrl}/beaver-ai/api/ai/message/v1/send_message`,
    data,
  })
}

/**
 * @description: 列某会话下的话题（话题 = AI 上下文边界）
 */
export const listAgentTopicsApi = (data: IListAgentTopicsReq) => {
  return ajax<IListAgentTopicsRes>({
    method: 'POST',
    url: `${baseUrl}/beaver-ai/api/ai/sync/v1/list_topics`,
    data,
  })
}

/**
 * @description: 拉某话题的历史消息（服务端单一数据源，天然跨端）
 */
export const listAgentMessagesApi = (data: IListAgentMessagesReq) => {
  return ajax<IListAgentMessagesRes>({
    method: 'POST',
    url: `${baseUrl}/beaver-ai/api/ai/message/v1/list_messages`,
    data,
  })
}

/**
 * @description: 回传本机工具结果（代发确认卡点击后走这里，叫醒服务端挂起的调用）
 */
export const submitAgentToolResultApi = (data: ISubmitClientToolResultReq) => {
  return ajax({
    method: 'POST',
    url: `${baseUrl}/beaver-ai/api/ai/message/v1/submit_client_tool_result`,
    data,
  })
}
