import { ipcRenderer } from 'electron'

class IpcRenderManager {
  /**
   * 向主进程发送异步消息（单向通信）
   * 渲染进程发送消息后立即返回，不等待主进程响应
   * 适用于：日志记录、窗口操作等不需要返回值的场景
   * @param event - IPC 事件名称
   * @param command - 要发送的 IPC 命令
   * @param data - 附带的数据
   */
  send(event: string, command: string, data?: any) {
    ipcRenderer.send(event, command, data)
  }

  /**
   * 向主进程发送同步消息（双向通信，阻塞式）
   * 渲染进程会等待主进程处理完成并返回结果
   * 注意：会阻塞渲染进程，可能导致界面卡顿
   * 适用于：配置获取、存储操作等需要立即返回结果的场景
   * @param event - IPC 事件名称
   * @param command - 要发送的 IPC 命令
   * @param data - 附带的数据
   * @returns 主进程返回的结果
   */
  sendSync(event: string, command: string, data?: any) {
    return ipcRenderer.sendSync(event, command, data)
  }

  /**
   * 向主进程发送异步消息（双向通信，非阻塞式）
   * 渲染进程发送消息后立即返回 Promise，不阻塞界面
   * 适用于：需要异步处理结果的场景，如网络请求、复杂计算等
   * @param event - IPC 事件名称
   * @param command - 要发送的 IPC 命令
   * @param data - 附带的数据
   * @returns Promise<any> 主进程处理结果的 Promise
   */
  invoke(event: string, command: string, data?: any) {
    return ipcRenderer.invoke(event, command, data)
  }

  /**
   * 向当前页面的 webContents 发送消息
   * 用于在同一个渲染进程中不同页面间通信
   * 适用于：主页面与子页面、弹窗等之间的消息传递
   * @param event - IPC 事件名称
   * @param command - 要发送的 IPC 命令
   * @param data - 附带的数据
   */
  sendToHost(event: string, command: string, data?: any) {
    ipcRenderer.sendToHost(event, command, data)
  }

  /**
   * 监听主进程发送的消息
   * 用于接收主进程主动推送的消息，如进度更新、状态变化等
   * @param event - IPC 事件名称
   * @param callback - 回调函数，接收事件和参数
   */
  on(event: string, callback: (event: any, ...args: any[]) => void) {
    ipcRenderer.on(event, callback)
  }

  /**
   * 移除指定事件的监听器
   * 用于清理不再需要的监听器，避免内存泄漏
   * @param event - IPC 事件名称
   * @param callback - 要移除的回调函数
   */
  removeListener(event: string, callback: (event: any, ...args: any[]) => void) {
    ipcRenderer.removeListener(event, callback)
  }
}

export default new IpcRenderManager()
