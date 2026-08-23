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

// 登录模块配置
export const LOGIN_CONFIG = {
  email: {
    label: '邮箱地址',
    placeholder: '请输入邮箱地址',
    type: 'email',
    rules: [
      { required: true, message: '请输入邮箱地址', trigger: 'blur' },
      { pattern: /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/, message: '请输入有效的邮箱格式', trigger: 'blur' },
    ],
  },
  password: {
    label: '密码',
    placeholder: '请设置6-20位密码',
    type: 'password',
    minLength: 6,
    maxLength: 20,
    rules: [
      { required: true, message: '请输入密码', trigger: 'blur' },
      { min: 6, max: 20, message: '密码长度在 6 到 20 个字符', trigger: 'blur' },
    ],
  },
  code: {
    placeholder: '请输入验证码',
    type: 'text',
    maxLength: 6,
    rules: [
      { required: true, message: '请输入验证码', trigger: 'blur' },
      { pattern: /^\d{6}$/, message: '验证码为6位数字', trigger: 'blur' },
    ],
  },
} as const
