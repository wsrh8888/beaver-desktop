/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/beaver — 官方包（share 契约 + 主/渲染门面）
 *
 *   /common/type/*   插件可见类型
 *   /main            主进程门面（仍需 bindMain）
 *   /renderer        渲染进程门面（直接打 electron.xxx，无需 bind）
 *
 * 宿主内部类型继续用 src/common（commonModule）。
 */
export {}
