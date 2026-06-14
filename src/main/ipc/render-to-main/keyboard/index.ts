import type { KeyboardActionId } from 'commonModule/type/mainStore'
import { KeyboardCommand } from 'commonModule/type/ipc/command'
import { getScreenshots } from 'mainModule/utils/capture'
import logger from 'mainModule/utils/log'
import { BrowserWindow, globalShortcut } from 'electron'

function toElectronAccelerator(binding: string): string {
  return binding
    .split('+')
    .map(part => part.trim())
    .filter(Boolean)
    .map((part) => {
      if (part === 'Ctrl') {
        return 'CommandOrControl'
      }
      if (part === 'Cmd') {
        return 'Command'
      }
      return part
    })
    .join('+')
}

class KeyboardHandler {
  /** actionId → 已注册的 Electron accelerator */
  private registered = new Map<KeyboardActionId, string>()

  set(actionId: KeyboardActionId, binding: string) {
    // 如果是发送消息，则不注册
    if (actionId === 'sendMessage') {
      return
    }
    this.unregister(actionId)

    if (!binding) {
      return
    }
    

    const accelerator = toElectronAccelerator(binding)
    const registered = globalShortcut.register(accelerator, () => {
      this.handleAction(actionId)
    })
    if (!registered) {
      logger.warn({
        text: '键盘快捷键注册失败',
        data: { actionId, binding, accelerator },
      }, 'KeyboardHandler')
      return
    }

    this.registered.set(actionId, accelerator)
  }

  private unregister(actionId: KeyboardActionId) {
    const accelerator = this.registered.get(actionId)
    if (!accelerator) {
      return
    }
    globalShortcut.unregister(accelerator)
    this.registered.delete(actionId)
  }

  private handleAction(actionId: KeyboardActionId) {
    switch (actionId) {
      case 'screenshot':
        getScreenshots().startCapture()
        break
      case 'toggleWindow': {
        const windows = BrowserWindow.getAllWindows().filter(win => !win.isDestroyed())
        if (!windows.length) {
          return
        }
        if (windows.some(win => win.isVisible())) {
          windows.forEach(win => win.hide())
        }
        else {
          windows.forEach(win => win.show())
          windows[0].focus()
        }
        break
      }
      case 'sendMessage':
        break
      default:
        logger.warn({
          text: '未知快捷键动作',
          data: { actionId },
        }, 'KeyboardHandler')
    }
  }

  handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: KeyboardCommand | string,
    data?: { actionId?: KeyboardActionId, binding?: string },
  ): void {
    if (command !== KeyboardCommand.SET || !data?.actionId || data.binding === undefined) {
      return
    }
    this.set(data.actionId, data.binding)
  }
}

export default new KeyboardHandler()
