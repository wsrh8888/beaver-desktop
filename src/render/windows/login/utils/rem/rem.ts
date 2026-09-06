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
const logger = new Logger('rem')

// src/render/login/utils/rem.ts - 登录窗口适配

// 基准设计宽度（登录窗口：800*500）
const BASE_SIZE = 800
// 设置最大字体大小，避免在大屏幕下字体过大
const MAX_FONT_SIZE = 64

export function setupRem(): void {
  const html = document.documentElement

  function updateRem() {
    logger.info({ text: 'updateRem 开始' })
    // 获取视窗宽度
    const viewWidth = html.clientWidth || window.innerWidth

    // 计算根字体大小 (以16px为基准，与postcss-pxtorem的rootValue保持一致)
    let fontSize = 16 * (viewWidth / BASE_SIZE)

    // 限制最大字体大小
    if (fontSize > MAX_FONT_SIZE) {
      fontSize = MAX_FONT_SIZE
    }

    // 设置根字体大小
    html.style.fontSize = `${fontSize}px`
  }

  // 初始设置
  updateRem()

  // 窗口大小变化时更新
  window.addEventListener('resize', updateRem)

  // 页面显示/切换时更新
  window.addEventListener('pageshow', (e) => {
    if (e.persisted) {
      updateRem()
    }
  })
}

// 自动执行
setupRem()
