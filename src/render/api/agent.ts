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
  ISendAgentMessageReq,
  ISendAgentMessageRes,
} from 'commonModule/type/ajax/agent'
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
