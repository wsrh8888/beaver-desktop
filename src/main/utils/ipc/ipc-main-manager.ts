import { ipcMain } from 'electron'

class IpcMainManager {
  /**
   * 注册一个监听器，用于指定的 IPC 命令。
   * @param command - 要监听的 IPC 命令。
   * @param listener - 用于处理事件的回调函数。
   */
  on(
    command: any,
    listener: (event: Electron.IpcMainEvent, command: any, data: any) => void,
  ) {
    if (!command)
      return
    ipcMain.on(command, listener)
  }

  /**
   * 移除之前注册的监听器，用于指定的 IPC 命令。
   * @param command - 要移除监听器的 IPC 命令。
   * @param listener - 注册监听器时使用的回调函数。
   */
  public off(
    command: string,
    listener: (event: Electron.IpcMainEvent, data: any) => void,
  ) {
    if (!command)
      return
    ipcMain.removeListener(command, listener)
  }

  /**
   * 注册一个同步处理程序，用于指定的 IPC 命令。
   * @param command - 要处理的 IPC 命令。
   * @param listener - 用于处理调用事件的回调函数。
   */
  handle(
    command: string,
    listener: (event: Electron.IpcMainInvokeEvent, command: any, data: any) => Promise<unknown>,
  ) {
    if (!command)
      return
    ipcMain.handle(command, listener)
  }

  /**
   * 移除之前注册的异步处理程序，用于指定的 IPC 命令。
   * @param command - 要移除处理程序的 IPC 命令。
   */
  removeHandler(command: string) {
    if (!command)
      return
    ipcMain.removeHandler(command)
  }
}

export default new IpcMainManager()
