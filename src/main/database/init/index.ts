/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import { getRegisteredTableInits } from '@beaver-im/beaver/main'
import { initChatTables } from './chat/index'
import { initDatasyncTables } from './datasync/index'
import { initEmojiTables } from './emoji/index'
import { initFriendTables } from './friend/index'
import { initGroupTables } from './group/index'
import { initMediaTables } from './media/index'
import { initNotificationTables } from './notification/index'
import { initUserTables } from './user/index'
import Logger from 'mainModule/utils/logger'

const logger = new Logger('DBInit')

export const initTables = (db: any) => {
  logger.info({ text: '开始初始化数据表' })
  initUserTables(db)
  initFriendTables(db)
  initGroupTables(db)
  initChatTables(db)
  initEmojiTables(db)
  initDatasyncTables(db)
  initNotificationTables(db)
  initMediaTables(db)
  // 插件自注册建表（如圈子），宿主不点名业务包
  for (const init of getRegisteredTableInits())
    init(db)
  logger.info({ text: '数据表初始化完成' })
}
