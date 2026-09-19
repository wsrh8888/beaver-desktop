/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { INotificationPayload } from './types'
import { NotificationCircleCommand } from '@beaver-im/app-circle/common'
import Logger from 'renderModule/utils/logger'
import circleNotificationManager from './circle'

const logger = new Logger('圈子模块通知路由器')

class CircleNotificationRouter {
  async handleNotification(params: INotificationPayload) {
    logger.info({
      text: '收到圈子模块通知',
      data: params,
    })

    switch (params.command) {
      case NotificationCircleCommand.CIRCLE_UPDATE:
        await circleNotificationManager.processCircleUpdate(params.data)
        break
      default:
        logger.warn({ text: '未知的圈子通知命令', data: { command: params.command } })
    }
  }
}

export const circleNotificationRouter = new CircleNotificationRouter()
