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

import circleBusiness from 'mainModule/business/circle/circle'

/**
 * @description: 圈子资料接收器 - 处理 circles 表更新
 */
class CircleReceiver {
  async handleTableUpdates(tableUpdatesBody: any) {
    const { tables } = tableUpdatesBody

    for (const update of tables || []) {
      switch (update.table) {
        case 'circles':
          for (const dataItem of update.data || []) {
            if (dataItem?.circleId && dataItem?.version) {
              await circleBusiness.handleTableUpdates(dataItem.circleId, dataItem.version)
            }
          }
          break
        default:
          break
      }
    }
  }
}

export default new CircleReceiver()
