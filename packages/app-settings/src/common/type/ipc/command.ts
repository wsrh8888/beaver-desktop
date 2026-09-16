/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @description: 用户设置（主进程 store 读写）相关 Command
 */
export enum SettingsCommand {
  /** 初始化用户设置（登录后拉取云端） */
  SETTINGS_INIT = 'settings:init',
  /** 获取用户设置 */
  SETTINGS_GET = 'settings:get',
  /** 保存用户设置 */
  SETTINGS_UPDATE = 'settings:update',
}
