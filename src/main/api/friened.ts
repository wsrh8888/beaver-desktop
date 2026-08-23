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
  IGetFriendsListByIdsReq,
  IGetFriendsListByIdsRes,
  IGetFriendVerifiesListByIdsReq,
  IGetFriendVerifiesListByIdsRes,
} from 'commonModule/type/ajax/friend'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 批量获取好友数据
 */
export const getFriendsListByIdsApi = (data: IGetFriendsListByIdsReq) => {
  return ajax<IGetFriendsListByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/friend/v1/getFriendsListByIds`,
  })
}

/**
 * @description: 批量获取好友验证数据
 */
export const getFriendVerifiesListByIdsApi = (data: IGetFriendVerifiesListByIdsReq) => {
  return ajax<IGetFriendVerifiesListByIdsRes>({
    method: 'POST',
    data: {
      verifyIds: data.verifyIds,
    },
    url: `${getBaseUrl()}/api/friend/v1/getFriendVerifiesListByIds`,
  })
}
