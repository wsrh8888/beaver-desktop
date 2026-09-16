/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

export interface IEmbedViewBounds {
  x: number
  y: number
  width: number
  height: number
}

export type EmbedViewLoadState = 'loading' | 'loaded' | 'failed'

export interface IEmbedViewStatePayload {
  tabId: string
  state: EmbedViewLoadState
}
