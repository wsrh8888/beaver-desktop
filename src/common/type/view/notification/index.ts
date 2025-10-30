export interface INotificationItem {
  /**
   * 通知记录ID（UUID）
   */
  id: string
  /**
   * 用户昵称
   */
  name: string
  /**
   * 用户头像文件名
   */
  avatar?: string
  /**
   * 时间
   */
  time: string
  /**
   * 消息内容
   */
  message: string
  /**
   * 状态值
   */
  status?: number
  /**
   * 是否为群通知
   */
  isGroup?: boolean
  /**
   * 状态文本（由父组件处理）
   */
  statusText?: string
  /**
   * 状态样式类（由父组件处理）
   */
  statusClass?: string
  /**
   * 是否可以同意
   */
  canApprove?: boolean
  /**
   * 是否可以拒绝
   */
  canReject?: boolean
}
