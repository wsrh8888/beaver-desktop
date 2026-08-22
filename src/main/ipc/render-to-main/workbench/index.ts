import { WorkbenchCommand } from 'commonModule/type/ipc/command'
import { BrowserWindow, shell } from 'electron'
import workbenchWebContentsView from 'mainModule/web-contents-view/workbench/workbench'
import logger from 'mainModule/utils/log'

class WorkbenchHandler {
  handle(
    event: Electron.IpcMainEvent | Electron.IpcMainInvokeEvent,
    command: WorkbenchCommand | string,
    data: any,
  ) {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (!win)
      return

    switch (command) {
      case WorkbenchCommand.EMBED_OPEN:
        workbenchWebContentsView.open(win, data?.tabId, data?.url, data?.bounds)
        break
      case WorkbenchCommand.EMBED_HIDE_ALL:
        workbenchWebContentsView.hideAll(win)
        break
      case WorkbenchCommand.EMBED_SET_BOUNDS:
        workbenchWebContentsView.setBounds(win, data?.tabId, data?.bounds)
        break
      case WorkbenchCommand.EMBED_RELOAD:
        workbenchWebContentsView.reload(win, data?.tabId)
        break
      case WorkbenchCommand.EMBED_CLOSE:
        workbenchWebContentsView.closeTab(win, data?.tabId)
        break
      case WorkbenchCommand.OPEN_EXTERNAL: {
        const url = typeof data?.url === 'string' ? data.url.trim() : ''
        if (!url || !/^https?:\/\//i.test(url)) {
          logger.error({ text: `工作台外开地址不合法: ${url}` }, 'WorkbenchHandler')
          break
        }
        void shell.openExternal(url)
        break
      }
      default:
        logger.error({ text: `工作台处理未知命令: ${command}` }, 'WorkbenchHandler')
        break
    }
  }
}

export default new WorkbenchHandler()
