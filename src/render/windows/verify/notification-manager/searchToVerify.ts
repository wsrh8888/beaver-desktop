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

import type { INotificationPayload } from 'commonModule/type/preload/notification'
import { NotificationModule, NotificationSearchToVerifyCommand } from 'commonModule/type/preload/notification'
import { useVerifyStore } from '../pinia/verify'

class SearchToVerifyEventManager {
  constructor() {
  }

  init() {
    electron.notification.on(NotificationModule.SEARCH_TO_VERIFY, this.handle)
  }

  off() {
    electron.notification.off(NotificationModule.SEARCH_TO_VERIFY, this.handle)
  }

  handle(params: INotificationPayload<NotificationModule.SEARCH_TO_VERIFY>) {
    console.log('verify 收到通知', params)
    switch (params.command) {
      case NotificationSearchToVerifyCommand.SEARCH_TO_VERIFY: {
        const verifyStore = useVerifyStore()
        verifyStore.updateSearchData(params.data, params.data.type)
        break
      }
      default:
        break
    }
  }
}
export default new SearchToVerifyEventManager()
