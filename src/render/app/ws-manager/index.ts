import { wsUrl } from "commonModule/config";
import { v4 as uuidv4 } from 'uuid';

interface WsMessage {
  command: string;
  content: {
    timestamp: number;
    messageId: string;
    data: any;
  };
}

class WsManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: number | null = null;
  private heartbeatTimer: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private isManualClose = false;
  
  public isConnected = false;

  async connect(): Promise<void> {
    // 防止重复连接
    if (this.isConnected || this.socket) {
      console.log('WebSocket已经连接或正在连接中');
      return;
    }

    if (!electron.app.token) {
      console.warn('没有token，无法连接WebSocket');
      return;
    }

    console.log('开始连接WebSocket...');
    this.isManualClose = false;

    try {
      this.socket = new WebSocket(`${wsUrl}?token=${electron.app.token}`);
      
      this.socket.onopen = () => {
        console.log('WebSocket连接成功');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
      };

      this.socket.onclose = () => {
        console.log('WebSocket连接关闭');
        this.isConnected = false;
        this.clearTimers();
        if (!this.isManualClose) this.reconnect();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket错误:', error);
        this.isConnected = false;
      };

      this.socket.onmessage = (event) => {
        this.handleMessage(event.data);
      };

    } catch (error) {
      console.error('WebSocket连接失败:', error);
      this.reconnect();
    }
  }

  private handleMessage(data: string) {
    try {
      const message = JSON.parse(data);
      
      // 心跳响应直接忽略
      if (message.command === 'HEARTBEAT') return;

      // 导入并调用 store 处理消息
      import('renderModule/app/pinia/ws/ws').then(({ useWsStore }) => {
        useWsStore().parseWsMessage(message);
      });
    } catch (error) {
      console.error('消息解析失败:', error);
    }
  }

  sendChatMessage(data: any, customMessageId?: string): void {
    if (!this.isConnected || !this.socket) {
      console.warn('WebSocket未连接');
      return;
    }

    const message: WsMessage = {
      command: 'CHAT_MESSAGE',
      content: {
        timestamp: Date.now(),
        messageId: customMessageId || uuidv4(),
        data: data  // 这里直接传递data，让调用方决定结构
      }
    };

    this.socket.send(JSON.stringify(message));
    console.log('发送WebSocket消息:', message);
  }

  private startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.sendHeartbeat();
    }, 30000) as unknown as number;
  }

  private sendHeartbeat() {
    if (this.isConnected && this.socket) {
      const heartbeat = {
        command: 'HEARTBEAT',
        content: {
          timestamp: Date.now(),
          messageId: uuidv4(),
          data: null
        }
      };
      this.socket.send(JSON.stringify(heartbeat));
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) return;
    
    this.reconnectAttempts++;
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, 5000 * this.reconnectAttempts) as unknown as number;
  }

  private clearTimers() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  disconnect() {
    console.log('断开WebSocket连接...');
    this.isManualClose = true;
    this.clearTimers();
    
    if (this.socket) {
      if (this.isConnected) {
        this.socket.close();
      }
      this.socket = null;
    }
    
    this.isConnected = false;
    this.reconnectAttempts = 0;
    console.log('WebSocket连接已断开');
  }
}

export default new WsManager(); 