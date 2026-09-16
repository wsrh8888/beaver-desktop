/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 获取最新版本请求 */
export interface IGetLatestVersionReq {
  appId: string
  platformId: number
  archId: number
}

/** 获取最新版本响应 */
export interface IGetLatestVersionRes {
  hasUpdate: boolean
  forceUpdate?: boolean
  version?: string
  fileUrl: string
  size: number
  md5: string
  description?: string
  releaseNotes?: string
}
