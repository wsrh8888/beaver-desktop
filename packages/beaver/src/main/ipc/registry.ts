/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 插件注册的数据库 IPC 通道处理器（对应宿主 DatabaseCommand） */
export type DatabaseIpcHandler = (
  event: any,
  command: string,
  data: any,
  header: { userId: string },
) => Promise<unknown>

const handlers = new Map<string, DatabaseIpcHandler>()

/** 插件自注册数据库 IPC（宿主 DatabaseHandler 按 command 分发，不点名业务包） */
export function registerDatabaseIpcHandler(command: string, handler: DatabaseIpcHandler): void {
  handlers.set(command, handler)
}

export function getDatabaseIpcHandler(command: string): DatabaseIpcHandler | undefined {
  return handlers.get(command)
}

/** 插件自注册的通用 IPC 处理器（按 command 字符串集合匹配，不点名业务包） */
export type IpcHandler = (
  event: any,
  command: string,
  data: any,
) => unknown

const ipcHandlers = new Map<string, IpcHandler>()

/** 能力包 activate 时注册自有命令集合的 IPC 处理器（宿主 routeCommand 按 command 命中分发） */
export function registerIpcHandler(commands: string[], handler: IpcHandler): void {
  for (const command of commands)
    ipcHandlers.set(command, handler)
}

export function getIpcHandler(command: string): IpcHandler | undefined {
  return ipcHandlers.get(command)
}
