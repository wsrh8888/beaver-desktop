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

import type { ICircleSyncReq, ICircleSyncRes } from '../../common/type/ajax/circle'
import type { IGetSyncCircleInfoReq, IGetSyncCircleInfoRes } from '../../common/type/ajax/datasync'
import { ajax, getBaseUrl } from '@beaver-im/beaver/main'

export const circleSyncApi = (data: ICircleSyncReq) => {
  return ajax<ICircleSyncRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/circle/v1/circle/sync`,
  })
}

/** datasync：拉取圈子版本摘要 */
export const datasyncGetSyncCircleInfoApi = (data: IGetSyncCircleInfoReq) => {
  return ajax<IGetSyncCircleInfoRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/datasync/v1/getSyncCircleInfo`,
  })
}
