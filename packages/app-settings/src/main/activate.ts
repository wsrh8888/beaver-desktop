/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IMainActivateContext } from '@beaver-im/beaver'
import { SettingsCommand } from '../common/type/ipc/command'
import { registerIpcHandler } from '@beaver-im/beaver/main'
import settingsHandler from './ipc/render-to-main/settings'

/**
 * 设置插件 activate：向平台注册自有 IPC 命令集合（settings:init/get/update）。
 * 只应由宿主 activatePlugins 调用，禁止在模块顶层副作用注册。
 * 官方能力包接线（路1），非第三方插件市场。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  registerIpcHandler(Object.values(SettingsCommand), (event, command, data) =>
    settingsHandler.handle(event, command as any, data),
  )
}
