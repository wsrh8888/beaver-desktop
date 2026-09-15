/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { getMainRuntime } from '../../bind'

/**
 * 主进程通知渲染进程（对齐原 mainModule/ipc/main-to-render.sendMainNotification）
 * module/command 用 string，具体枚举由各能力包自己的 type 提供。
 */
export function sendMainNotification(
  targetName: string,
  module: string,
  command: string,
  payload?: any,
): void {
  getMainRuntime().ipc.sendMainNotification(targetName, module, command, payload)
}
