/**
 * 基础消息处理器类
 */
import type { ContextMenuItem } from 'renderModule/components/ui/context-menu/index.vue'
import { deleteMessageApi, recallMessageApi } from 'renderModule/api/chat'
import Message from 'renderModule/components/ui/message'
import { useMessageStore } from 'renderModule/windows/app/pinia/message/message'
import { useMessageViewStore } from 'renderModule/windows/app/pinia/view/message'
import { copyToClipboard as copyTextToClipboard } from 'renderModule/windows/app/page/message/right-component/content/utils/copy'

export interface IMessageHandler {
  handleCommand(commandId: string, message: any): Promise<void>
  getSupportedCommands(): string[]
  getMenuItems(hasTextSelected?: boolean, isSender?: boolean): ContextMenuItem[]
}

export abstract class BaseMessageHandler implements IMessageHandler {
  abstract handleCommand(commandId: string, message: any): Promise<void>
  abstract getSupportedCommands(): string[]
  abstract getMenuItems(hasTextSelected?: boolean, isSender?: boolean): ContextMenuItem[]

  /** 复制文本到剪贴板（走 utils/copy，Electron 下主进程） */
  protected async copyToClipboard(text: string): Promise<void> {
    await copyTextToClipboard(text)
  }

  /** 撤回消息：调用服务端接口，成功后本地状态改为已撤回 */
  protected async recallMessage(message: any): Promise<void> {
    const createdAt = new Date(message.created_at).getTime()
    if (Date.now() - createdAt > 2 * 60 * 1000) {
      Message.error('超过2分钟，无法撤回')
      return
    }
    const res = await recallMessageApi({ messageId: message.messageId })
    if (res.code === 0) {
      const messageStore = useMessageStore()
      messageStore.updateMessageStatus(message.conversationId, message.messageId, 2)
    }
    else {
      Message.error(res.msg || '撤回失败')
    }
  }

  /** 删除消息（云端+本地，仅对自己生效，对方仍可见） */
  protected async deleteMessage(message: any): Promise<void> {
    const res = await deleteMessageApi({ messageId: message.messageId })
    if (res.code === 0) {
      const messageStore = useMessageStore()
      await messageStore.removeMessages(message.conversationId, [message.messageId])
    }
    else {
      Message.error(res.msg || '删除失败')
    }
  }

  /** 设置引用回复消息 */
  protected setReplyMessage(message: any): void {
    const messageViewStore = useMessageViewStore()
    messageViewStore.setReplyingTo(message)
  }

  /** 进入多选模式，并预先选中当前消息 */
  protected enterMultiSelect(message: any): void {
    const messageViewStore = useMessageViewStore()
    messageViewStore.enterMultiSelect(message.messageId)
  }

  // 公共方法：下载文件
  protected async downloadFile(url: string, filename: string): Promise<void> {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = downloadUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(downloadUrl)
    }
    catch (error) {
      console.error('文件下载失败:', error)
      throw error
    }
  }
}
