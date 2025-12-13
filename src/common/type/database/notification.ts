// 通知相关表（与服务端 notification_models 保持一致）
export interface IDBNotificationEvent {
  id?: number
  eventId: string
  eventType: string
  category: string
  version?: number
  fromUserId?: string
  targetId?: string
  targetType: string
  payload?: string
  priority?: number
  status?: number
  dedupHash?: string
  createdAt?: number
  updatedAt?: number
}

export interface IDBNotificationInbox {
  id?: number
  userId: string
  eventId: string
  eventType: string
  category: string
  version?: number
  isRead?: number
  readAt?: number
  status?: number
  isDeleted?: number
  silent?: number
  createdAt?: number
  updatedAt?: number
}

export interface IDBNotificationReadCursor {
  id?: number
  userId: string
  category: string
  version?: number
  lastReadAt?: number
  createdAt?: number
  updatedAt?: number
}

