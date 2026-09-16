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
 * 音频播放器插件 activate：无自有 IPC/datasync，仅占位对齐插件契约。
 * 只应由宿主 activatePlugins 调用。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  // 音频窗口为纯独立窗口，无主进程管道需注册
}
