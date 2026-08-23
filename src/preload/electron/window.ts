/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

import type { IWindowModule, IWindowOpenOptions, IWinodwCloseOptions } from 'commonModule/type/preload/window'
import { WinHook } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

// --- Window Management Module ---
export const windowModule: IWindowModule = {
  closeWindow: (name?: string, options?: IWinodwCloseOptions) => {
    // 隐藏窗口到后台而不是关闭
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.CLOSE, { name, options })
  },
  openWindow: async (name: string, options?: IWindowOpenOptions): Promise<void> => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WinHook.OPEN_WINDOW, { name, options })
  },
  minimize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MINIMIZE)
  },
  maximize: () => {
    ipcRenderManager.send(IEvent.RenderToMain, WinHook.MAXIMIZE)
  },
  captureScreen: () =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, WinHook.CAPTURE_SCREEN, {}),
}
