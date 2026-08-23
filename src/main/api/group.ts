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
  IGroupJoinRequestSyncReq,
  IGroupJoinRequestSyncRes,
  IGroupMemberSyncReq,
  IGroupMemberSyncRes,
  IGroupSearchReq,
  IGroupSearchRes,
  IGroupSyncReq,
  IGroupSyncRes,
} from 'commonModule/type/ajax/group'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 群组数据同步
 */
export const groupSyncApi = (data: IGroupSyncReq) => {
  return ajax<IGroupSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/v1/sync`,
  })
}

/**
 * @description: 群成员数据同步
 */
export const groupMemberSyncApi = (data: IGroupMemberSyncReq) => {
  return ajax<IGroupMemberSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/v1/member_sync`,
  })
}

/**
 * @description: 群组申请数据同步
 */
export const groupJoinRequestSyncApi = (data: IGroupJoinRequestSyncReq) => {
  return ajax<IGroupJoinRequestSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/group/v1/join_request_sync`,
  })
}

/**
 * @description: 搜索群组
 */
export const searchGroupsApi = (data: IGroupSearchReq) => {
  return ajax<IGroupSearchRes>({
    method: 'GET',
    params: data,
    url: `${getBaseUrl()}/api/group/v1/search`,
  })
}
