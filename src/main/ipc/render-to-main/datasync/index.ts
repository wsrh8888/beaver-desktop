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

import { DataSyncCommand } from 'commonModule/type/ipc/command'
import { dataSyncManager } from 'mainModule/datasync/manager'
import wsManager from 'mainModule/ws-manager'
// 数据同步处理器
class DataSyncHandler {
  // 处理IPC命令
  async handle(_event: Electron.IpcMainInvokeEvent, command: DataSyncCommand, _data: any = {}): Promise<any> {
    console.log('11111111111111111111111111', command, _data)
    switch (command) {
      case DataSyncCommand.MANUAL_SYNC:
        await dataSyncManager.autoSync()
        return { success: true }
      case DataSyncCommand.GET_APP_LIFECYCLE_STATUS:
        return await this.getAppLifecycleStatus()
      default:
        return null
    }
  }

  // 获取应用生命周期初始状态
  private async getAppLifecycleStatus(): Promise<{ status: string }> {
    const wsStatus = wsManager.getStatus()
    const dataSyncStatus = dataSyncManager.getStatus()

    // 根据WebSocket和数据同步状态确定应用状态
    let appStatus: string
    switch (wsStatus) {
      case 'connecting':
        appStatus = 'connecting'
        break
      case 'connected':
        // WebSocket连接成功，根据数据同步状态确定
        appStatus = dataSyncStatus === 'syncing' ? 'syncing' : 'ready'
        break
      case 'error':
        appStatus = 'connect_error'
        break
      case 'closed':
      default:
        appStatus = 'connecting'
        break
    }

    return { status: appStatus }
  }
}

export default new DataSyncHandler()
