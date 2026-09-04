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

import { DataUserCommand } from 'commonModule/type/ipc/database'
import dBServiceUser  from 'mainModule/database/services/user/user'

import Logger from 'mainModule/utils/logger'

const loggerName = 'database-user-handler'
const logger = new Logger(loggerName)

class UserHandler {
  /**
   * 处理用户相关的数据库命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataUserCommand, data: any = {}, header: any = {}): Promise<any> {
    try {
      switch (command) {
        case DataUserCommand.GET_USER_INFO:
          return await dBServiceUser.getUserById(header, data)
        case DataUserCommand.GET_USERS_BASIC_INFO:
          return {
            users: await dBServiceUser.getUsersBasicInfo({ userIds: data.userIds }),
          }
        case DataUserCommand.GET_ALL_USERS:
          return {
            users: await dBServiceUser.getAllUsers({}),
          }
        default:
          throw new Error(`不支持的用户数据库命令: ${command}`)
      }
    }
    catch (error) {
      logger.error({
        text: '用户数据库命令处理失败',
        data: { command, message: (error as Error)?.message, stack: (error as Error)?.stack },
      })
      throw error
    }
  }
}

export default new UserHandler()
