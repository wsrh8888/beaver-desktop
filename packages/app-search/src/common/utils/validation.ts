/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/** 常用验证函数（本包所需子集）。宿主 commonModule/utils/validation 同值；按模块边界允许重复。 */

export const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(email?.trim() || '')
}
