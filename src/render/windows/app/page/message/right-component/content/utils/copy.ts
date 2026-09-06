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

import Logger from 'renderModule/utils/logger';
const logger = new Logger('copy')

/**
 * 复制相关功能（仅 Electron，统一走主进程）
 */

/**
 * 复制文本到剪贴板（主进程 clipboard.copyText）
 */
export async function copyToClipboard(text: string): Promise<boolean> {
    logger.info({ text: 'copyToClipboard 开始' })
  if (!text || text.trim().length === 0)
    return false
  return window.electron.clipboard.copyText(text)
}

/**
 * 获取当前选中的文本
 */
export function getSelectedText(): string {
    logger.info({ text: 'getSelectedText 开始' })
  const selection = window.getSelection()
  if (selection && selection.toString().trim().length > 0)
    return selection.toString().trim()
  return ''
}

/**
 * 检查是否有文本被选中
 */
export function hasTextSelected(): boolean {
    logger.info({ text: 'hasTextSelected 开始' })
  const selection = window.getSelection()
  return !!(selection && selection.toString().trim().length > 0)
}
