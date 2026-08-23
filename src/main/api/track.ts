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

import type { ILogEventsReq } from 'commonModule/type/ajax/track'
import axios from 'axios'
import { getBaseUrl } from 'commonModule/config'

/**
 * @description: 记录客户端日志（独立 axios，避免走 ajax 日志链路造成递归）
 */
export const logEventsApi = (data: ILogEventsReq) => {
  return axios(
    {
      method: 'POST',
      url: `${getBaseUrl()}/api/platform/track_public/v1/log`,
      data,
    },
  ).then(res => res.data)
}
