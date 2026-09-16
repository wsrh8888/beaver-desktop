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

import type { IAddFriendReq, IAddFriendRes, IResSearchUserInfo, ISearchUser } from '../../common/type/ajax/friend'
import { baseUrl } from '@beaver-im/beaver'
import { ajax } from '@beaver-im/beaver/renderer'

/**
 * @description: 搜索好友（通过用户ID或邮箱）
 */
export const getSearchFriendApi = (data: ISearchUser) => {
  return ajax<IResSearchUserInfo>({
    method: 'GET',
    params: data, // 使用 params 而不是 data，因为是 GET 请求
    url: `${baseUrl}/api/friend/v1/search`,
  })
}

/**
 * @description: 申请添加好友
 */
export const applyAddFriendApi = (data: IAddFriendReq) => {
  return ajax<IAddFriendRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/friend/v1/add_friend`,
  })
}
