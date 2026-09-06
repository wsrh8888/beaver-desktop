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

import { ipcMain } from 'electron'
import Logger from 'mainModule/utils/logger';
const logger = new Logger('ipc-main-manager')


class IpcMainManager {
  /**
   * 注册一个监听器，用于指定的 IPC 命令。
   * @param command - 要监听的 IPC 命令。
   * @param listener - 用于处理事件的回调函数。
   */
  on(
    command: any,
    listener: (event: Electron.IpcMainEvent, command: any, data: any) => void,
  ) {
    if (!command)
      return
    ipcMain.on(command, listener)
  }

  /**
   * 移除之前注册的监听器，用于指定的 IPC 命令。
   * @param command - 要移除监听器的 IPC 命令。
   * @param listener - 注册监听器时使用的回调函数。
   */
  public off(
    command: string,
    listener: (event: Electron.IpcMainEvent, data: any) => void,
  ) {
    if (!command)
      return
    ipcMain.removeListener(command, listener)
  }

  /**
   * 注册一个同步处理程序，用于指定的 IPC 命令。
   * @param command - 要处理的 IPC 命令。
   * @param listener - 用于处理调用事件的回调函数。
   */
  handle(
    command: string,
    listener: (event: Electron.IpcMainInvokeEvent, command: any, data: any) => Promise<unknown>,
  ) {
    if (!command)
      return
    ipcMain.handle(command, listener)
  }

  /**
   * 移除之前注册的异步处理程序，用于指定的 IPC 命令。
   * @param command - 要移除处理程序的 IPC 命令。
   */
  removeHandler(command: string) {
    logger.info({ text: 'removeHandler 开始' })
    if (!command)
      return
    ipcMain.removeHandler(command)
  }
}

export default new IpcMainManager()
