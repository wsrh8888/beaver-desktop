/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IUserSettingsRes } from '../../common/type/ajax/user'
import { ajax, getBaseUrl } from '@beaver-im/beaver/main'

/**
 * @description: 获取用户设置（主进程侧）
 */
export const getUserSettingsApi = () => {
  return ajax<IUserSettingsRes>({
    method: 'GET',
    url: `${getBaseUrl()}/api/user/v1/settings`,
  })
}
