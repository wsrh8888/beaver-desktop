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

import { type INotificationPayload, NotificationModule, NotificationCallCommand } from 'commonModule/type/preload/notification'
import { useIncomingStore } from '../pinia/incoming'
import Logger from 'renderModule/utils/logger';
const logger = new Logger('index')


/**
 * 来电通知窗口通知管理（中间层）
 *
 * 流程约定：仅在被叫场景存在；主叫不会打开本窗口。
 * - 被叫：先打开本窗口并收到 CALL_INVITE，展示来电；用户接听后再打开 call 窗口（CALL_JOIN）。
 * - 收到 ACCEPTED / REJECTED / HANGUP / CANCELLED 时关窗（接听则 call 窗口会打开，拒绝/挂断则结束）。
 */
class NotificationManager {
  init() {
    logger.info({ text: 'init 开始' })
    const incomingStore = useIncomingStore()
    const params = (electron as any)?.app?.params
    if (params) incomingStore.setCallInfo(params)
    electron.notification.on(NotificationModule.CALL, this.handleNotification)
  }

  handleNotification = (params: INotificationPayload<NotificationModule.CALL>) => {
    const { command, data } = params
    const roomId = data?.roomInfo?.roomId
    if (!roomId) return

    const incomingStore = useIncomingStore()
    const currentRoomId = incomingStore.callInfo.roomInfo?.roomId
    if (currentRoomId && roomId !== currentRoomId) return

    switch (command) {
      case NotificationCallCommand.CALL_INVITE:
        incomingStore.setCallInfo(data)
        break

      case NotificationCallCommand.CALL_REJECTED:
      case NotificationCallCommand.CALL_ACCEPTED:
      case NotificationCallCommand.CALL_HANGUP:
      case NotificationCallCommand.CALL_CANCELLED:
        electron.window.closeWindow()
        break
    }
  }

  off() {
    logger.info({ text: 'off 开始' })
    electron.notification.off(NotificationModule.CALL, this.handleNotification)
  }
}

export default new NotificationManager()
