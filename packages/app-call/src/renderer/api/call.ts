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
  IGetCallTokenReq,
  IGetCallTokenRes,
  IHangupCallReq,
  IHangupCallRes,
  IInviteCallMemberReq,
  IInviteCallMemberRes,
} from '../../common/type/ajax/call'
import { baseUrl } from '@beaver-im/beaver'
import { ajax } from '@beaver-im/beaver/renderer'

/**
 * @description: 接听通话并获取令牌
 */
export const getCallTokenApi = (data: IGetCallTokenReq) => {
  return ajax<IGetCallTokenRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/token`,
  })
}

/**
 * @description: 主动挂断或拒绝通话
 */
export const hangupCallApi = (data: IHangupCallReq) => {
  return ajax<IHangupCallRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/hangup`,
  })
}

/**
 * @description: 邀请成员加入通话
 */
export const inviteCallMemberApi = (data: IInviteCallMemberReq) => {
  return ajax<IInviteCallMemberRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/call/v1/invite`,
  })
}
