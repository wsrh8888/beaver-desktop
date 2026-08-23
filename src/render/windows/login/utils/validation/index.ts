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

import { LOGIN_CONFIG } from '../../config'

// 通用验证函数
export const validateField = (value: string, fieldName: keyof typeof LOGIN_CONFIG): string => {
  const field = LOGIN_CONFIG[fieldName]
  const { rules = [] } = field

  for (const rule of rules) {
    // 必填验证
    if (rule.required && !value?.trim()) {
      return rule.message
    }

    // 正则验证
    if (rule.pattern && !rule.pattern.test(value)) {
      return rule.message
    }

    // 长度验证
    if (rule.min && value.length < rule.min) {
      return rule.message
    }

    if (rule.max && value.length > rule.max) {
      return rule.message
    }
  }

  return ''
}
