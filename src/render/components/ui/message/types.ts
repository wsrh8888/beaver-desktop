export type MessageType = 'success' | 'warning' | 'info' | 'error'

export interface MessageOptions {
  message?: string
  type?: MessageType
  duration?: number
  showClose?: boolean
  center?: boolean
  dangerouslyUseHTMLString?: boolean
  zIndex?: number
  onClose?(): void
}

export interface MessageInstance {
  close(): void
}

export interface MessageApiMethods {
  (options: MessageOptions | string): MessageInstance
  success(message: string, options?: Omit<MessageOptions, 'message' | 'type'>): MessageInstance
  warning(message: string, options?: Omit<MessageOptions, 'message' | 'type'>): MessageInstance
  info(message: string, options?: Omit<MessageOptions, 'message' | 'type'>): MessageInstance
  error(message: string, options?: Omit<MessageOptions, 'message' | 'type'>): MessageInstance
  closeAll(): void
}
