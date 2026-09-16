/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 登录设备信息（设置页设备管理子集） */
export interface IDeviceInfo {
  deviceId: string
  deviceType: string
  deviceOs: string
  deviceModel: string
  deviceOsVersion: string
  deviceName: string
  lastLoginTime: string
  isOnline: boolean
  lastLoginIp?: string
}

export interface IGetDevicesRes {
  devices: IDeviceInfo[]
}

/** 踢下线设备请求 */
export interface IKickDeviceReq {
  deviceId: string
}

/** 踢下线设备响应 */
export interface IKickDeviceRes {}
