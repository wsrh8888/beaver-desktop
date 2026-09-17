/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  IMarkReadByCategoryReq,
  IMarkReadByCategoryRes,
} from '@packageCommon/type/ajax/notification'
import { ajax, getBaseUrl } from '@beaver-im/beaver/renderer'

/** 按分类标记通知已读（朋友圈 inbox 用） */
export const markReadByCategoryApi = (data: IMarkReadByCategoryReq) => {
  return ajax<IMarkReadByCategoryRes>({
    data,
    method: 'POST',
    url: `${getBaseUrl()}/api/notification/v1/markReadByCategory`,
  })
}
