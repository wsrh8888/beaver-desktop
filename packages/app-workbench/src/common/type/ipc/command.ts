/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * @description: 工作台内嵌 WebContentsView 相关 Command
 */
export enum WorkbenchCommand {
  EMBED_OPEN = 'workbench:embedOpen',
  EMBED_HIDE_ALL = 'workbench:embedHideAll',
  EMBED_SET_BOUNDS = 'workbench:embedSetBounds',
  EMBED_RELOAD = 'workbench:embedReload',
  EMBED_CLOSE = 'workbench:embedClose',
  OPEN_EXTERNAL = 'workbench:openExternal',
}
