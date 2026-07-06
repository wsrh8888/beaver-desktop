import type {
  IWorkbenchEmbedBounds,
  IWorkbenchEmbedStatePayload,
} from 'commonModule/type/main/web-contents-view/workbench'

export type { IWorkbenchEmbedBounds, IWorkbenchEmbedStatePayload }

export interface IWorkbenchModule {
  openEmbed: (data: { tabId: string, url: string, bounds: IWorkbenchEmbedBounds }) => Promise<void>
  hideAllEmbeds: () => Promise<void>
  setEmbedBounds: (data: { tabId: string, bounds: IWorkbenchEmbedBounds }) => Promise<void>
  reloadEmbed: (data: { tabId: string }) => Promise<void>
  closeEmbed: (data: { tabId: string }) => Promise<void>
  onEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => void
  offEmbedState: (callback: (_event: unknown, payload: IWorkbenchEmbedStatePayload) => void) => void
}
