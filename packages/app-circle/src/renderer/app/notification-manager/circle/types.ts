/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { NotificationCircleCommand } from '@beaver-im/app-circle/common/type/notification'

/** 圈子通知载荷（不依赖宿主 NotificationModule 泛型） */
export interface INotificationPayload {
  command: NotificationCircleCommand
  data?: any
}
