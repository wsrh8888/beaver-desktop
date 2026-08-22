import type { IClipboardModule } from 'commonModule/type/preload/clipboard'
import { ClipboardCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const clipboardModule: IClipboardModule = {
  copyImage: (fileKey: string) =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, ClipboardCommand.COPY_IMAGE, { fileKey }),
  copyText: (text: string) =>
    ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, ClipboardCommand.COPY_TEXT, { text }),
}
