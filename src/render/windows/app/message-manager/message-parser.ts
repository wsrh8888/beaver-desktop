import { MessageType } from 'commonModule/type/ajax/chat'

export interface MessagePart {
  type: 'text' | 'image' | 'video' | 'emoji' | 'file'
  content: any
}

/**
 * @description: 消息解析工具 - 负责将 UI 数据 (DOM / 文本) 转换为结构化消息块
 */
export class MessageParser {
  /**
   * @description: 从 contenteditable 元素解析出消息块
   */
  static parseFromEditor(editorElement: HTMLElement): MessagePart[] {
    const parts: MessagePart[] = []

    const walk = (node: Node) => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent
        if (text) {
          parts.push({ type: 'text', content: text })
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement
        if (el.tagName === 'IMG') {
          const fileKey = el.getAttribute('data-file-key')
          const type = el.getAttribute('data-type') as MessagePart['type'] || 'image'
          const info = el.getAttribute('data-info')

          if (fileKey) {
            parts.push({
              type,
              content: {
                fileKey,
                ...(info ? JSON.parse(info) : {})
              }
            })
          }
        } else if (el.tagName === 'BR') {
          parts.push({ type: 'text', content: '\n' })
        } else {
          node.childNodes.forEach(child => walk(child))
        }
      }
    }

    editorElement.childNodes.forEach(child => walk(child))

    return this.mergeTextParts(parts)
  }

  /**
   * @description: 合并连续的文本块
   */
  private static mergeTextParts(parts: MessagePart[]): MessagePart[] {
    const merged: MessagePart[] = []
    for (const part of parts) {
      const last = merged[merged.length - 1]
      if (part.type === 'text' && last && last.type === 'text') {
        last.content += part.content
      } else {
        merged.push(part)
      }
    }
    return merged
  }

  /**
   * @description: 将 Part 类型映射为 MessageType
   */
  static mapPartToType(type: MessagePart['type']): MessageType {
    switch (type) {
      case 'text': return MessageType.TEXT
      case 'image': return MessageType.IMAGE
      case 'video': return MessageType.VIDEO
      case 'emoji': return MessageType.EMOJI
      case 'file': return MessageType.FILE
      default: return MessageType.FILE
    }
  }
}
