import { MessageType } from 'commonModule/type/ajax/chat'
import type { IMessageMsg } from 'commonModule/type/ws/message-types'

/**
 * @description: 从编辑器 DOM 提取结构化消息列表 (IMessageMsg 格式)
 * 遵循语义化：IMG 仅代表图片或表情
 */
export function parseEditorDOM(editorElement: HTMLElement): IMessageMsg[] {
  const messages: IMessageMsg[] = []

  const walk = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent
      if (text) {
        messages.push({
          type: MessageType.TEXT,
          textMsg: { content: text }
        })
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement
      if (el.tagName === 'IMG') {
        const fileKey = el.getAttribute('data-file-key')
        const typeStr = el.getAttribute('data-type') || 'image'
        const infoStr = el.getAttribute('data-info')
        const info = infoStr ? JSON.parse(infoStr) : {}

        if (fileKey) {
          const msg: IMessageMsg = { type: MessageType.IMAGE }

          // 只处理本应属于 IMG 标签的类型
          if (typeStr === 'emoji') {
            msg.type = MessageType.EMOJI
            msg.emojiMsg = {
              fileKey,
              emojiId: info.emojiId || '',
              packageId: info.packageId || '',
              width: info.width,
              height: info.height
            }
          } else {
            // 纯图片
            msg.type = MessageType.IMAGE
            msg.imageMsg = {
              fileKey,
              width: info.width || 0,
              height: info.height || 0
            }
          }
          messages.push(msg)
        }
      } else if (el.tagName === 'BR') {
        messages.push({
          type: MessageType.TEXT,
          textMsg: { content: '\n' }
        })
      } else {
        node.childNodes.forEach(child => walk(child))
      }
    }
  }

  editorElement.childNodes.forEach(child => walk(child))

  // 合并连续文本块
  const merged: IMessageMsg[] = []
  for (const msg of messages) {
    const last = merged[merged.length - 1]
    if (msg.type === MessageType.TEXT && last && last.type === MessageType.TEXT && last.textMsg && msg.textMsg) {
      last.textMsg.content += msg.textMsg.content
    } else {
      merged.push(msg)
    }
  }
  return merged
}
