
class WsManager {
  reconnectInterval = 5000; // 重连间隔时间
  reconnectTimer = null; // 用于保存重连的定时器Id
  isConnected = false;
  isClose = false;
  messageCallback: (message: any) => void = () => { };
  socket:WebSocket
  url = ""

  constructor() {


  }

  open(url: string) {
    this.url = url;

  }

  createWebSocket() {
    this.isClose = false;
    const ws = new WebSocket(this.url);
    ws.onopen = this.onOpen.bind(this)
    ws.onerror = this.onError.bind(this)
    ws.onmessage = this.onMessage.bind(this)
    ws.onclose = this.onClose.bind(this)
    this.socket = ws;
  }

  onOpen() {
    console.log('ws 已连接');
    this.isConnected = true;

    // 链接成功后销毁重连定时器
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  onClose() {
    console.log('ws 已关闭');

    this.isConnected = false;
    if (this.isClose) {
      return;
    }
    this.reconnect();
  }

  onError() {
    console.log('ws 连接错误');
    this.isConnected = false;
    this.socket.close(); // 先关闭之前的连接
    this.reconnect();
  }

  onMessage(event) {
    console.log('收到消息', event);
    // 解析消息
    const message = JSON.parse(event.data || '{}');
    console.log('收到消息', message);
    if (this.messageCallback) {
      this.messageCallback(event);
    }
  }

  setMessageCallback(callback: (message: any) => void) {
    this.messageCallback = callback;
  }

  reconnect() {
    this.socket.close(); // 先关闭之前的连接
    if (!this.isConnected) {
      console.log(`尝试在 ${this.reconnectInterval / 1000} 秒后重新连接`);
      this.reconnectTimer = setTimeout(() => {
        this.reconnectTimer = null; // 重置定时器Id
        this.createWebSocket();
      }, this.reconnectInterval);
    }
  }

  sendChatMessage(data: any) {
    this._sendMessage({
      command: 'COMMON_CHAT_MESSAGE',
      content: {
        timestamp: Date.now(),
        data: data,
      },
    });
  }

  _sendMessage(message: {}) {
    if (this.isConnected) {
      this.socket.send(JSON.stringify(message));
      console.log('消息发送成功', message);
    } else {
      console.log('ws 未连接，无法发送消息');
    }
  }

  close() {
    this.isClose = true;
    if (this.isConnected) {
      this.socket.close();
      console.log('ws 已主动关闭');
    }
  }
}

export default new WsManager();
