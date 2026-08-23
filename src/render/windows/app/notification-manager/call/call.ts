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

import Logger from 'renderModule/utils/logger'
import { useCallListStore } from '../../pinia/call-list'

const logger = new Logger('通话通知处理器')

/**
 * @description: 通话通知处理器 - 处理来电邀请等通知
 */
class CallNotificationManager {
  /**
   * 处理来电邀请 - 添加到通话列表并弹窗
   */
  async processCallInvite(data: {
    roomInfo: { roomId: string }
    callType: number // 1-私聊, 2-群聊
    callerId: string
    conversationId: string
    timestamp: number
  }) {
    const roomId = data.roomInfo.roomId
    logger.info({
      text: '处理来电邀请',
      data
    })

    const callListStore = useCallListStore()

    // 添加到来电列表
    callListStore.addIncomingCall({
      roomId: roomId,
      callType: data.callType === 1 ? 'private' : 'group',
      callerId: data.callerId,
      conversationId: data.conversationId,
      timestamp: data.timestamp || Date.now()
    })

    // 异步加载来电者信息
    this.loadCallerInfo(roomId, data.callerId)

    // 自动弹出来电窗口
    this.openIncomingWindow(data)
  }

  /**
   * 打开来电窗口
   */
  private openIncomingWindow(data: {
    roomInfo: { roomId: string }
    callType: number
    callerId: string
    conversationId: string
  }) {
    const callListStore = useCallListStore()
    // 检查是否有活跃通话
    const activeCalls = callListStore.activeCalls
    const hasActiveCall = activeCalls.length > 0
    const activeCallRoomId = hasActiveCall ? activeCalls[0].roomId : ''

    // 打开 call-incoming 窗口
    electron.window.openWindow('call-incoming', {
      width: 360,
      height: 180,
      params: {
        roomInfo: data.roomInfo,
        callType: data.callType === 1 ? 'private' : 'group',
        callerId: data.callerId,
        conversationId: data.conversationId,
        callMode: 'audio',
        role: 'callee',
        autoAccept: false,
        // 传递当前通话状态
        hasActiveCall,
        activeCallRoomId
      }
    })
  }

  /**
   * 处理通话结束
   */
  processCallEnded(data: { roomInfo: { roomId: string } }) {
    const roomId = data.roomInfo.roomId
    logger.info({
      text: '处理通话结束',
      data
    })

    const callListStore = useCallListStore()
    callListStore.removeCall(roomId)

    // 如果该通话对应的来电窗口打开着，尝试关闭它
    // 注意：这里只能尝试通过 electron API 关闭，但渲染进程只有 openWindow
    // 实际上 call-incoming 窗口内部如果监听了状态变化会自动关闭，或者主进程会处理
    // 这里我们假设主进程或 call-incoming 自身逻辑会处理窗口关闭
    // 为了保险，我们可以再次调用 openWindow 但通常不支持远程关闭
    // 更好的做法是主进程收到 RTC_HANGUP/CANCEL 时关闭对应窗口，这一步主进程已经做了
  }

  /**
   * 异步加载来电者信息
   */
  private async loadCallerInfo(roomId: string, callerId: string) {
    try {
      const result = await electron.database.user.getUsersBasicInfo({ userIds: [callerId] })
      if (result?.users?.length) {
        const user = result.users.find((u: any) => u.userId === callerId)
        if (user) {
          const callListStore = useCallListStore()
          callListStore.updateCallerInfo(roomId, {
            name: user.nickName || user.userId,
            avatar: user.avatar
          })
        }
      }
    } catch (error) {
      logger.error({
        text: '加载来电者信息失败',
        data: { error }
      })
    }
  }
}

export default new CallNotificationManager()
