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
  IDeleteNotificationReq,
  IDeleteNotificationRes,
  IGetUnreadSummaryReq,
  IGetUnreadSummaryRes,
  IMarkReadByCategoryReq,
  IMarkReadByCategoryRes,
  IMarkReadByCursorReq,
  IMarkReadByCursorRes,
  IMarkReadByEventReq,
  IMarkReadByEventRes,
} from 'commonModule/type/ajax/notification'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 按事件ID标记单个通知已读
 */
export const markReadByEventApi = (data: IMarkReadByEventReq) => {
  return ajax<IMarkReadByEventRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/v1/markReadByEvent`,
  })
}

/**
 * @description: 按事件ID删除单个通知
 */
export const deleteNotificationApi = (data: IDeleteNotificationReq) => {
  return ajax<IDeleteNotificationRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/v1/deleteNotification`,
  })
}

/**
 * @description: 按分类标记所有通知为已读
 */
export const markReadByCategoryApi = (data: IMarkReadByCategoryReq) => {
  return ajax<IMarkReadByCategoryRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/v1/markReadByCategory`,
  })
}

/**
 * @description: 按分类游标标记已读（高效批量，高级用法）
 */
export const markReadByCursorApi = (data: IMarkReadByCursorReq) => {
  return ajax<IMarkReadByCursorRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/v1/markReadByCursor`,
  })
}

/**
 * @description: 获取未读汇总（红点）
 */
export const getUnreadSummaryApi = (data: IGetUnreadSummaryReq) => {
  return ajax<IGetUnreadSummaryRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/v1/getUnreadSummary`,
  })
}
