import { v4 as uuidV4 } from 'uuid'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'

/**
 * @description: 核心消息发送模块 - 独立于 Store 状态，可供系统任意渲染层调用
 */
export class ChatCore {

  /**
   * @description: 发送消息核心方法
   * @param conversationId 会话ID
   * @param msg 消息内容 (按照 IMessageMsg 协议格式)
   * @param chatType 会话类型
   * @returns Promise<string> 返回生成的消息ID
   */
  static async sendMessage(
    conversationId: string,
    msg: IMessageMsg,
    chatType: 'private' | 'group'
  ): Promise<any> {
    // 1. 基础验证
    if (!conversationId) {
      throw new Error('消息发送失败: 缺失 conversationId')
    }
    if (!msg || typeof msg !== 'object') {
      throw new Error('消息发送失败: 消息内容格式错误')
    }
    const messageId = uuidV4()

    // 2. 深度克隆消息内容，防止 Vue 响应式代理引发的并发或主进程通信问题
    const msgClone = JSON.parse(JSON.stringify(msg))

    // 3. 投递并返回主进程构造的完整消息对象
    return await window.electron.websocket.chat.sendMessage({
      conversationId,
      messageId: messageId,
      msg: msgClone,
      chatType
    })
  }
}
