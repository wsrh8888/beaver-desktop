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

// 添加网络连接事件监听器，当网络连接时触发
window.addEventListener('online', () => {
  console.info('[addNetWorkListener][online] 网络已连接')
})

// 添加网络断开事件监听器，当网络断开时触发
window.addEventListener('offline', () => {
  console.error('[addNetWorkListener][offline] 网络已断开')
})

// 设置全局异常处理
window.onerror = (message, source, lineno, colno, error) => {
  console.error(`[GlobalErrorHandler] 未捕获的错误: ${message} at ${source}:${lineno}:${colno}`, error)
}
