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
  IGetNotificationEventsByIdsReq,
  IGetNotificationEventsByIdsRes,
  IGetNotificationInboxByIdsReq,
  IGetNotificationInboxByIdsRes,
  IGetNotificationReadCursorsReq,
  IGetNotificationReadCursorsRes,
} from 'commonModule/type/ajax/notification'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 按ID拉取通知事件明细
 */
export const getNotificationEventsByIdsApi = (data: IGetNotificationEventsByIdsReq) => {
  return ajax<IGetNotificationEventsByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/notification/v1/getEventsByIds`,
  })
}

/**
 * @description: 按ID拉取通知收件箱明细
 */
export const getNotificationInboxByIdsApi = (data: IGetNotificationInboxByIdsReq) => {
  return ajax<IGetNotificationInboxByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/notification/v1/getInboxByIds`,
  })
}

/**
 * @description: 按分类拉取通知已读游标
 */
export const getNotificationReadCursorsApi = (data: IGetNotificationReadCursorsReq) => {
  return ajax<IGetNotificationReadCursorsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/notification/v1/getReadCursors`,
  })
}
