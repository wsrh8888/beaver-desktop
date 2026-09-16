/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 圈子通知通道（主进程 sendMainNotification / 宿主 NotificationModule.DATABASE_CIRCLE） */
export const CIRCLE_NOTIFICATION_MODULE = 'database:circle' as const

export type CircleNotificationModule = typeof CIRCLE_NOTIFICATION_MODULE

/** 圈子主进程 → 渲染通知命令 */
export enum NotificationCircleCommand {
  /**
   * 圈子资料更新
   */
  CIRCLE_UPDATE = 'circleUpdate',
}
