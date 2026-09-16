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
 * 升级更新插件 activate：无自有 IPC/datasync，仅占位对齐插件契约。
 * 只应由宿主 activatePlugins 调用。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  // 升级窗口为纯独立窗口，下载/安装走 preload 桥（electron.update.* / electron.cache.*）
}
