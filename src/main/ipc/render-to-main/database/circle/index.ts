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

import type { ICommonHeader } from 'commonModule/type/ajax/common'
import { DataCircleCommand } from 'commonModule/type/ipc/database'
import circleBusiness from 'mainModule/business/circle/circle'
import { store } from 'mainModule/store'
import logger from 'mainModule/utils/log'

const loggerName = 'circle-handler'

class CircleHandler {
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataCircleCommand, _data: any, _header: ICommonHeader): Promise<any> {
    logger.info({ text: '处理圈子命令', data: { command } }, loggerName)
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }

    switch (command) {
      case DataCircleCommand.GET_CIRCLE_LIST:
        return {
          list: await circleBusiness.getCircleList(),
        }
      default:
        throw new Error('圈子数据库命令处理失败CircleHandler')
    }
  }
}

export default new CircleHandler()
