/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 圈子 datasync 版本摘要（原 commonModule/type/ajax/datasync 圈子段） */
export interface IGetSyncCircleInfoReq {
  since?: number
}

export interface ICircleInfoVersionItem {
  circleId: string
  version: number
}

export interface IGetSyncCircleInfoRes {
  circleVersions: ICircleInfoVersionItem[]
  serverTimestamp: number
}
