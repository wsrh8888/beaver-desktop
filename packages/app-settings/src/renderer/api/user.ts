/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  IUpdateUserSettingsReq,
  IUpdateUserSettingsRes,
} from '../../common/type/ajax/user'
import { ajax, getBaseUrl } from '@beaver-im/beaver/renderer'

/**
 * @description: 更新用户设置（渲染侧）
 */
export const updateUserSettingsApi = (data: IUpdateUserSettingsReq) => {
  return ajax<IUpdateUserSettingsRes>({
    data,
    method: 'POST',
    url: `${getBaseUrl()}/api/user/v1/update_settings`,
  })
}
