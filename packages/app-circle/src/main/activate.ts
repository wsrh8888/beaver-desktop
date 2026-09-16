/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IMainActivateContext } from '@beaver-im/beaver'
import {
  registerConversationDisplayProvider,
  registerDatabaseIpcHandler,
  registerDataSync,
  registerTableInit,
  registerWsHandler,
} from '@beaver-im/beaver/main'
import { CIRCLE_DATABASE_IPC } from '../common/type/ipc/database'
import { circleConversationDisplayProvider } from './conversation/display-provider'
import { initCircleTables } from './database/init/circle'
import { circleDatasync } from './datasync/circle'
import circleHandler from './ipc/render-to-main/database/circle'
import circleMessageRouter from './message-manager/receivers/circle'

/**
 * 圈子插件 activate：向平台注册 datasync / WS / 数据库 IPC / 建表 / 会话展示。
 * 只应由宿主 activatePlugins 调用，禁止在模块顶层副作用注册。
 * 官方能力包接线（路1），非第三方插件市场。
 */
export async function activate(_ctx: IMainActivateContext): Promise<void> {
  registerDataSync(circleDatasync)
  registerWsHandler('CIRCLE_OPERATION', content => circleMessageRouter.processCircleMessage(content))
  registerDatabaseIpcHandler(CIRCLE_DATABASE_IPC, (event, command, data, header) =>
    circleHandler.handle(event, command as any, data, header),
  )
  registerTableInit(initCircleTables)
  registerConversationDisplayProvider(circleConversationDisplayProvider)
}
