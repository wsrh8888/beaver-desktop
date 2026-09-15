/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 与宿主 commonModule/type/cache/cache 对齐，供 UI 组件与业务侧共用 */
export enum CacheType {
  USER_AVATAR = 'user_avatar',
  USER_DB = 'user_db',
  USER_LOGS = 'user_logs',
  PUBLIC_LOGS = 'public_logs',
  PUBLIC_UPDATE = 'public_update',
  USER_VIDEO = 'user_video',
  USER_IMAGE = 'user_image',
}
