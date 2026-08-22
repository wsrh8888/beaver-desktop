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
