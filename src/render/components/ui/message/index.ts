import type { MessageApiMethods, MessageInstance, MessageOptions } from './types'
import { createApp } from 'vue'
import MessageComponent from './Message.vue'

// 存储当前的消息实例
interface MessageInstanceData {
  app: any
  container: HTMLElement
}

const instances: MessageInstanceData[] = []
let seed = 1

// 创建消息实例
const createMessage = (options: MessageOptions): MessageInstance => {
  const id = `message_${seed++}`
  const userOnClose = options.onClose

  // 创建容器
  const container = document.createElement('div')
  container.id = id

  // 合并选项，添加销毁方法
  const messageOptions = {
    ...options,
    onClose: userOnClose,
  }

  // 创建应用实例
  const app = createApp(MessageComponent, {
    ...messageOptions,
    onDestroy: () => {
      // 从DOM中移除
      if (container.parentNode) {
        container.parentNode.removeChild(container)
      }

      // 从实例列表中移除
      const index = instances.findIndex(instance => instance.container === container)
      if (index > -1) {
        instances.splice(index, 1)
      }

      // 销毁应用实例
      app.unmount()
    },
  })

  // 挂载到容器
  const vm = app.mount(container)

  // 添加到body
  document.body.appendChild(container)

  // 存储实例
  instances.push({ app, container })

  // 调整其他消息的位置
  updateMessagePositions()

  return {
    close: () => {
      (vm as any).close()
    },
  }
}

// 更新所有消息的位置
const updateMessagePositions = () => {
  instances.forEach((instance, index) => {
    const element = instance.container
    if (element) {
      element.style.top = `${20 + index * 60}px`
    }
  })
}

// 主要的Message函数
const Message = (options: MessageOptions | string): MessageInstance => {
  if (typeof options === 'string') {
    options = { message: options }
  }

  return createMessage(options)
}

// 快捷方法
Message.success = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}): MessageInstance => {
  return createMessage({
    ...options,
    message,
    type: 'success',
  })
}

Message.warning = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}): MessageInstance => {
  return createMessage({
    ...options,
    message,
    type: 'warning',
  })
}

Message.info = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}): MessageInstance => {
  return createMessage({
    ...options,
    message,
    type: 'info',
  })
}

Message.error = (message: string, options: Omit<MessageOptions, 'message' | 'type'> = {}): MessageInstance => {
  return createMessage({
    ...options,
    message,
    type: 'error',
  })
}

// 关闭所有消息
Message.closeAll = (): void => {
  instances.forEach((instance) => {
    const element = instance.container
    if (element) {
      const messageComponent = element.querySelector('.message')
      if (messageComponent) {
        (messageComponent as any)?.__vueParentComponent?.ctx?.close?.()
      }
    }
  })
}

export default Message as MessageApiMethods
export { MessageComponent }
export * from './types'
