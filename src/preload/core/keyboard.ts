import type { KeyboardActionId } from 'commonModule/type/mainStore'
import type { IKeyboardModule } from 'commonModule/type/preload/keyboard'
import { KeyboardCommand } from 'commonModule/type/ipc/command'
import { IEvent } from 'commonModule/type/ipc/event'
import ipcRenderManager from 'preloadModule/utils/ipcRender'

export const keyboardModule: IKeyboardModule = {
  set: (actionId: KeyboardActionId, binding: string) => {
    return ipcRenderManager.invoke(IEvent.RenderToMainSyncMsg, KeyboardCommand.SET, { actionId, binding })
  },
}
