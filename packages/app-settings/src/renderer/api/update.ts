/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  IGetLatestVersionReq,
  IGetLatestVersionRes,
} from '../../common/type/ajax/update'
import { ajax, getBaseUrl } from '@beaver-im/beaver/renderer'

/**
 * @description: 获取最新版本
 */
export const getLatestVersionApi = (data: IGetLatestVersionReq) => {
  return ajax<IGetLatestVersionRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/platform/update_public/v1/latest`,
  })
}
