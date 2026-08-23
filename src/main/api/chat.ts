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
  IChatSyncReq,
  IChatSyncRes,
  IGetConversationsListByIdsReq,
  IGetConversationsListByIdsRes,
  IGetUserConversationSettingsListByIdsReq,
  IGetUserConversationSettingsListByIdsRes,
} from 'commonModule/type/ajax/chat'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 某个会话的聊天数据同步
 */
export const chatSyncApi = (data: IChatSyncReq) => {
  return ajax<IChatSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/v1/sync`,
  })
}

/**
 * @description: 批量获取会话数据
 */
export const getConversationsListByIdsApi = (data: IGetConversationsListByIdsReq) => {
  return ajax<IGetConversationsListByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/v1/getConversationsListByIds`,
  })
}

/**
 * @description: 批量获取用户会话设置数据
 */
export const getUserConversationSettingsListByIdsApi = (data: IGetUserConversationSettingsListByIdsReq) => {
  return ajax<IGetUserConversationSettingsListByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/chat/v1/getUserConversationSettingsListByIds`,
  })
}
