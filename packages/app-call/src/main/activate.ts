/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IMainActivateContext } from '@beaver-im/beaver'

/**
 * 通话插件 activate：无自有 IPC/datasync，仅占位对齐插件契约。
 * 通话信令路由在宿主 message-manager/receivers/call（组合层），通过 CALL 通知驱动两个窗口。
 * 只应由宿主 activatePlugins 调用。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  // 通话窗口为纯独立窗口，LiveKit 连接在渲染进程 core 内完成，无主进程管道需注册
}
