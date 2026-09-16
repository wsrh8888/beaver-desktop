/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 键盘快捷键注册函数签名（宿主注入实现，能力包调用） */
export type KeyboardBindingHandler = (actionId: string, binding: string) => void

let handler: KeyboardBindingHandler | null = null

/**
 * 宿主在 bindMain 时注入真正的键盘注册实现（globalShortcut 等）。
 * 属宿主平台关注点；能力包（如 settings）通过 registerKeyboardBinding 调用，不直接依赖宿主。
 */
export function setKeyboardBindingHandler(fn: KeyboardBindingHandler): void {
  handler = fn
}

/** 能力包 activate 时注册键盘快捷键（宿主注入实现兜底） */
export function registerKeyboardBinding(actionId: string, binding: string): void {
  if (!handler) {
    return
  }
  handler(actionId, binding)
}
