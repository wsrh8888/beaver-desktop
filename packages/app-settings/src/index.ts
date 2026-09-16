/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @beaver-im/app-settings 设置能力包
 *
 *   main      — 设置窗口 application + 主进程 activate（IPC：init/get/update）
 *   renderer  — 设置独立窗口（settings-entry）
 *   common    — 设置领域类型（ajax/user、ipc/command、preload/settings、settings）
 *
 * 宿主 auth 登录流程通过 settingsHandler 触发 init；keyboard 注册走平台 registerKeyboardBinding。
 */
export {}
