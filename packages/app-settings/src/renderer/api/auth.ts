/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  IGetDevicesRes,
  IKickDeviceReq,
  IKickDeviceRes,
} from '../../common/type/ajax/auth'
import { ajax, getBaseUrl } from '@beaver-im/beaver/renderer'

/**
 * @description: 获取登录设备列表
 */
export const getDevicesApi = () => {
  return ajax<IGetDevicesRes>({
    method: 'GET',
    url: `${getBaseUrl()}/api/auth/auth/v1/devices`,
  })
}

/**
 * @description: 踢下线指定设备
 */
export const kickDeviceApi = (data: IKickDeviceReq) => {
  return ajax<IKickDeviceRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/auth/auth/v1/kick_device`,
  })
}
