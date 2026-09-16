/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

import type {
  IWorkbenchEmbedBounds,
  IWorkbenchEmbedStatePayload,
} from '../main/web-contents-view/workbench'

export type { IWorkbenchEmbedBounds, IWorkbenchEmbedStatePayload }

export interface IWorkbenchModule {
  openEmbed: (data: { tabId: string, url: string, bounds: IWorkbenchEmbedBounds }) => Promise<void>
  hideAllEmbeds: () => Promise<void>
  setEmbedBounds: (data: { tabId: string, bounds: IWorkbenchEmbedBounds }) => Promise<void>
  reloadEmbed: (data: { tabId: string }) => Promise<void>
  closeEmbed: (data: { tabId: string }) => Promise<void>
  openExternal: (data: { url: string }) => Promise<void>
  onEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => void
  offEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => void
}
