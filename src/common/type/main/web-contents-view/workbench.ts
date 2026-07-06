import type { EmbedViewLoadState, IEmbedViewBounds } from 'commonModule/type/main/embed-view'

export type IWorkbenchEmbedBounds = IEmbedViewBounds

export interface IWorkbenchEmbedStatePayload {
  tabId: string
  state: EmbedViewLoadState
}

export const WORKBENCH_EMBED_STATE_CHANNEL = 'workbench-embed-state'
