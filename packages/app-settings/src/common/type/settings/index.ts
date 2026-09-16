/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IUserSettingsKeyboard, IUserSettingsRes } from '../ajax/user'

export type { IUserSettingsKeyboard }

/** 设置里的快捷键 key */
export type KeyboardActionId = keyof IUserSettingsKeyboard

/** 用户设置（云端同步，主进程 store 缓存） */
export type IUserSettings = IUserSettingsRes
