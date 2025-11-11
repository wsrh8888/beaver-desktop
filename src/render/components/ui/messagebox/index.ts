import type { MessageBoxApiMethods, MessageBoxOptions } from './types'
import { createApp } from 'vue'
import MessageBoxComponent from './MessageBox.vue'

// 存储当前的消息框实例
interface MessageBoxInstanceData {
  app: any
  container: HTMLElement
  resolve(value: string): void
  reject(reason?: any): void
}

let currentInstance: MessageBoxInstanceData | null = null

// 创建消息框实例
const createMessageBox = (options: MessageBoxOptions): Promise<string> => {
  return new Promise((resolve, reject) => {
    // 如果已有实例，先关闭
    if (currentInstance) {
      closeMessageBox()
    }

    // 创建容器
    const container = document.createElement('div')
    container.className = 'messagebox-container'

    // 合并选项
    const messageBoxOptions = {
      ...options,
      visible: true,
      onConfirm: (value?: string) => {
        closeMessageBox()
        resolve(value || 'confirm')
      },
      onCancel: () => {
        closeMessageBox()
        reject(new Error('cancel'))
      },
      onClose: () => {
        closeMessageBox()
        reject(new Error('close'))
      },
    }

    // 创建应用实例
    const app = createApp(MessageBoxComponent, messageBoxOptions)

    // 挂载到容器
    app.mount(container)

    // 添加到body
    document.body.appendChild(container)

    // 存储实例
    currentInstance = {
      app,
      container,
      resolve,
      reject,
    }
  })
}

// 关闭消息框
const closeMessageBox = () => {
  if (currentInstance) {
    const { app, container } = currentInstance

    // 从DOM中移除
    if (container.parentNode) {
      container.parentNode.removeChild(container)
    }

    // 销毁应用实例
    app.unmount()

    // 清空实例
    currentInstance = null
  }
}

// 主要的MessageBox函数
const MessageBox = (options: MessageBoxOptions | string): Promise<string> => {
  if (typeof options === 'string') {
    options = { message: options }
  }

  return createMessageBox(options)
}

// alert 方法
MessageBox.alert = (
  message: string,
  title?: string,
  options: Omit<MessageBoxOptions, 'message' | 'title'> = {},
): Promise<string> => {
  return createMessageBox({
    ...options,
    message,
    title: title || '提示',
    type: options.type || 'info',
    showCancelButton: false,
    showConfirmButton: true,
  })
}

// confirm 方法
MessageBox.confirm = (
  message: string,
  title?: string,
  options: Omit<MessageBoxOptions, 'message' | 'title'> = {},
): Promise<string> => {
  return createMessageBox({
    ...options,
    message,
    title: title || '提示',
    type: options.type || 'warning',
    showCancelButton: true,
    showConfirmButton: true,
  })
}

// prompt 方法
MessageBox.prompt = (
  message: string,
  title?: string,
  options: Omit<MessageBoxOptions, 'message' | 'title'> = {},
): Promise<string> => {
  return createMessageBox({
    ...options,
    message,
    title: title || '提示',
    type: options.type || 'info',
    showCancelButton: true,
    showConfirmButton: true,
    inputType: 'text',
    inputPlaceholder: options.inputPlaceholder || '',
    inputValidator: options.inputValidator,
    inputErrorMessage: options.inputErrorMessage || '',
  })
}

// close 方法
MessageBox.close = (): void => {
  closeMessageBox()
}

export default MessageBox as MessageBoxApiMethods
export { MessageBoxComponent }
export * from './types'
