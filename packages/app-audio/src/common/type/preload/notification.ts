/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 媒体查看器通知枚举（本包所需子集）。
 * 宿主 commonModule/type/preload/notification 同值；按模块边界允许重复。
 */
export enum NotificationModule {
  /** 媒体查看器更新通知 */
  MEDIA_VIEWER = 'media:viewer',
}

export enum NotificationMediaViewerCommand {
  /** 更新音频播放器 data: { url, title? } */
  UPDATE_AUDIO = 'updateAudio',
}
