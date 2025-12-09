// 通知同步相关接口定义

// 按ID拉取通知事件
export interface IGetNotificationEventsByIdsReq {
  eventIds: string[]
}

export interface INotificationEventItem {
  eventId: string
  eventType: string
  category: string
  version: number
  fromUserId?: string
  targetId?: string
  targetType: string
  payload: string
  priority: number
  status: number
  dedupHash?: string
  createdAt: number
  updatedAt: number
}

export interface IGetNotificationEventsByIdsRes {
  events: INotificationEventItem[]
}

// 按ID拉取通知收件箱
export interface IGetNotificationInboxByIdsReq {
  eventIds: string[]
}

export interface INotificationInboxItem {
  eventId: string
  eventType: string
  category: string
  version: number
  isRead: boolean
  readAt: number
  status: number
  silent: boolean
  createdAt: number
  updatedAt: number
}

export interface IGetNotificationInboxByIdsRes {
  inbox: INotificationInboxItem[]
}

// 按分类拉取通知已读游标
export interface IGetNotificationReadCursorsReq {
  categories?: string[]
}

export interface INotificationReadCursorItem {
  category: string
  version: number
  lastEventId: string
  lastReadTime: number
  lastReadAt: number
}

export interface IGetNotificationReadCursorsRes {
  cursors: INotificationReadCursorItem[]
}

