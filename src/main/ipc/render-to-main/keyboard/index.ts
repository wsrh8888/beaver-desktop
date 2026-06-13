import type { KeyboardActionId } from 'commonModule/type/mainStore'
import { KeyboardCommand } from 'commonModule/type/ipc/command'
import searchApplication from 'mainModule/application/search'
import { getScreenshots } from 'mainModule/utils/capture'
import { store } from 'mainModule/store'
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

  init() {
    const keyboard = store.get('deviceSettings')!.keyboard
    ;(Object.keys(keyboard) as KeyboardActionId[]).forEach((actionId) => {
      this.set(actionId, keyboard[actionId])
    })
  }

  set(actionId: KeyboardActionId, binding: string) {
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

  /** 快捷键按下后，按 actionId 分发业务 */
  handleAction(actionId: KeyboardActionId) {
    switch (actionId) {
      case 'screenshot':
        getScreenshots().startCapture()
        break
      case 'search': {
        const existing = BrowserWindow.getAllWindows().find(win => (win as any).__appName === 'search')
        if (existing) {
          existing.show()
          existing.focus()
          return
        }
        searchApplication.createBrowserWindow()
        break
      }
      case 'toggleWindow': {
        const appWindow = BrowserWindow.getAllWindows().find(win => (win as any).__appName === 'app')
        if (!appWindow) {
          return
        }
        if (appWindow.isVisible() && appWindow.isFocused()) {
          appWindow.hide()
        }
        else {
          appWindow.show()
          appWindow.focus()
        }
        break
      }
      default:
        logger.warn({
          text: '未知快捷键动作',
          data: { actionId },
        }, 'KeyboardHandler')
    }
  }

  /** IPC 入口 */
  handle(
    _event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: KeyboardCommand | string,
    data?: { actionId?: KeyboardActionId, binding?: string },
  ): void {
    switch (command) {
      case KeyboardCommand.SET:
        if (!data?.actionId || !data.binding) {
          return
        }
        this.set(data.actionId, data.binding)
        break
      default:
        console.error(`键盘快捷键处理未知命令: ${command}`)
    }
  }
}

export default new KeyboardHandler()
