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
import { DataFriendCommand } from 'commonModule/type/ipc/database'
import friendBusiness from 'mainModule/business/friend/friend'
import friendVerifyBusiness from 'mainModule/business/friend/friend-verify'
import dBServiceFriend  from 'mainModule/database/services/friend/friend'
import dBServiceFriendVerify  from 'mainModule/database/services/friend/friend_verify'
import { store } from 'mainModule/store'

class FriendHandler {
  /**
   * 处理用户相关的数据库命令
   */
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataFriendCommand, data: any, header: ICommonHeader): Promise<any> {
    const userStore = store.get('userInfo')
    if (!userStore?.userId) {
      throw new Error('用户未登录')
    }
    switch (command) {
      case DataFriendCommand.GET_FRIENDS:
        return await friendBusiness.getFriendsList(header, data)
      case DataFriendCommand.GET_VALID_LIST:
        return await friendVerifyBusiness.getValidList(header, data)
      case DataFriendCommand.GET_FRIENDS_BY_VER_RANGE:
        return await friendBusiness.getFriendsByVerRange(header, data)
      case DataFriendCommand.GET_VALID_BY_VER_RANGE:
        return await friendVerifyBusiness.getValidByVerRange(header, data)
      case DataFriendCommand.GET_FRIENDS_BY_IDS:
        return await friendBusiness.getFriendsByIds(header, data)
      case DataFriendCommand.GET_VALID_BY_IDS:
        return await friendVerifyBusiness.getValidByIds(data.verifyIds)
      default:
        throw new Error('好友数据库命令处理失败FriendHandler')
    }
  }
}

export default new FriendHandler()
