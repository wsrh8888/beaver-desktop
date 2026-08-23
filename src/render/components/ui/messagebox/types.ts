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

export type MessageBoxType = 'success' | 'warning' | 'info' | 'error'

export interface MessageBoxOptions {
  title?: string
  message?: string
  type?: MessageBoxType
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  showConfirmButton?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  beforeClose?(action: string, instance: any, done: () => void): void
  dangerouslyUseHTMLString?: boolean
  center?: boolean
  roundButton?: boolean
  distinguishCancelAndClose?: boolean
  lockScroll?: boolean
  showClose?: boolean
  zIndex?: number
  inputType?: string
  inputPlaceholder?: string
  inputValidator?(value: string): boolean | string
  inputErrorMessage?: string
}

export interface MessageBoxInstance {
  close(): void
}

export interface MessageBoxApiMethods {
  (options: MessageBoxOptions | string): Promise<string>
  alert(message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>): Promise<string>
  confirm(message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>): Promise<string>
  prompt(message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>): Promise<string>
  close(): void
}
