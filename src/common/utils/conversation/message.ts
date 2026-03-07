import { MessageType } from '../../type/ajax/chat'

/**
 * @description: 生成消息预览文本
 * @param msg 消息协议体
 */
export function generateMessagePreview(msg: any): string {
  switch (msg.type) {
    case MessageType.TEXT:
      return msg.textMsg?.content || '[文本消息]'
    case MessageType.IMAGE:
      return '[图片]'
    case MessageType.VIDEO:
      return '[视频]'
    case MessageType.FILE:
      return `[文件] ${msg.fileMsg?.fileName || ''}`
    case MessageType.VOICE:
      return '[语音]'
    case MessageType.EMOJI:
      return '[表情]'
    case MessageType.WITHDRAW:
      return '[消息已撤回]'
    case MessageType.NOTIFICATION:
      return '[系统消息]'
    default:
      return '[未知消息]'
  }
}
