import { initNotificationEventsTable } from './event'
import { initNotificationInboxesTable } from './inbox'
import { initNotificationReadCursorsTable } from './read-cursor'

// 初始化通知相关表
export const initNotificationTables = (db: any) => {
  const sqlite = db.$client
  initNotificationEventsTable(sqlite)
  initNotificationInboxesTable(sqlite)
  initNotificationReadCursorsTable(sqlite)
}
