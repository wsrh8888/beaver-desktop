
const  { ipcRenderer } = require('electron')

class IpcRenderManager {
  /**
   * 向主进程发送异步消息。
   * @param command - 要发送的 IPC 命令。
   * @param data - 附带的数据。
   */
  send(event: string ,command: string, data?: any) {
    ipcRenderer.send(event, command, data);
  }
  invoke(event: string, command: string, data?: any) {
    return ipcRenderer.invoke(event, command, data);
  }
  sendToHost(event: string, command: string, data?: any) {
    ipcRenderer.sendToHost(event, command, data);
  }
  
}

export default new IpcRenderManager();
