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
 * 搜索/验证插件 activate：无自有 IPC/datasync，仅占位对齐插件契约。
 * search→verify 的跨窗口联动走 electron.notification（SEARCH_TO_VERIFY 通道），在渲染进程内完成。
 * 只应由宿主 activatePlugins 调用。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  // 搜索/验证为纯独立窗口，无主进程管道需注册
}
