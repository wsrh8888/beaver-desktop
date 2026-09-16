/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IMainActivateContext } from '@beaver-im/beaver'
import { WorkbenchCommand } from '../common/type/ipc/command'
import { registerIpcHandler } from '@beaver-im/beaver/main'
import workbenchHandler from './ipc/render-to-main/workbench'

/**
 * 工作台插件 activate：向平台注册自有 IPC 命令集合。
 * 只应由宿主 activatePlugins 调用，禁止在模块顶层副作用注册。
 * 官方能力包接线（路1），非第三方插件市场。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  registerIpcHandler(Object.values(WorkbenchCommand), (event, command, data) =>
    workbenchHandler.handle(event, command as any, data),
  )
}
