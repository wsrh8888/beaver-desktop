/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { IPluginManifest } from '@beaver-im/beaver/common/type/plugin'

/** 圈子能力包清单（供宿主插件加载器识别） */
export const circleManifest: IPluginManifest = {
  id: 'circle',
  name: 'Beaver Circle',
  version: '2.1.2',
  description: '圈子窗口 / 表 / datasync / ipc',
}
