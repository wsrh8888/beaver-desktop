/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type { EmbedViewLoadState, IEmbedViewBounds } from '../embed-view'

export type IWorkbenchEmbedBounds = IEmbedViewBounds

export interface IWorkbenchEmbedStatePayload {
  tabId: string
  state: EmbedViewLoadState
}

export const WORKBENCH_EMBED_STATE_CHANNEL = 'workbench-embed-state'
