export type MessageBoxType = 'success' | 'warning' | 'info' | 'error'

export interface MessageBoxOptions {
  title?: string
  message?: string
  type?: MessageBoxType
  confirmButtonText?: string
  cancelButtonText?: string
  showCancelButton?: boolean
  showConfirmButton?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  beforeClose?(action: string, instance: any, done: () => void): void
  dangerouslyUseHTMLString?: boolean
  center?: boolean
  roundButton?: boolean
  distinguishCancelAndClose?: boolean
  lockScroll?: boolean
  showClose?: boolean
  zIndex?: number
  inputType?: string
  inputPlaceholder?: string
  inputValidator?(value: string): boolean | string
  inputErrorMessage?: string
}

export interface MessageBoxInstance {
  close(): void
}

export interface MessageBoxApiMethods {
  (options: MessageBoxOptions | string): Promise<string>
  alert(message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>): Promise<string>
  confirm(message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>): Promise<string>
  prompt(message: string, title?: string, options?: Omit<MessageBoxOptions, 'message' | 'title'>): Promise<string>
  close(): void
}
