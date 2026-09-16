/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** WS command → 插件处理器（宿主 MessageManager 按 command 分发，不点名业务包） */
export type WsMessageHandler = (content: any) => void | Promise<void>

const handlers = new Map<string, WsMessageHandler>()

export function registerWsHandler(command: string, handler: WsMessageHandler): void {
  handlers.set(command, handler)
}

export function getWsHandler(command: string): WsMessageHandler | undefined {
  return handlers.get(command)
}
