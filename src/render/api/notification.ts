import type {
  IDeleteNotificationReq,
  IDeleteNotificationRes,
  IGetUnreadSummaryReq,
  IGetUnreadSummaryRes,
  IMarkReadByCategoryReq,
  IMarkReadByCategoryRes,
  IMarkReadByCursorReq,
  IMarkReadByCursorRes,
  IMarkReadByEventReq,
  IMarkReadByEventRes,
} from 'commonModule/type/ajax/notification'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 按事件ID标记单个通知已读
 */
export const markReadByEventApi = (data: IMarkReadByEventReq) => {
  return ajax<IMarkReadByEventRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/markReadByEvent`,
  })
}

/**
 * @description: 按事件ID删除单个通知
 */
export const deleteNotificationApi = (data: IDeleteNotificationReq) => {
  return ajax<IDeleteNotificationRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/deleteNotification`,
  })
}

/**
 * @description: 按分类标记所有通知为已读
 */
export const markReadByCategoryApi = (data: IMarkReadByCategoryReq) => {
  return ajax<IMarkReadByCategoryRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/markReadByCategory`,
  })
}

/**
 * @description: 按分类游标标记已读（高效批量，高级用法）
 */
export const markReadByCursorApi = (data: IMarkReadByCursorReq) => {
  return ajax<IMarkReadByCursorRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/markReadByCursor`,
  })
}

/**
 * @description: 获取未读汇总（红点）
 */
export const getUnreadSummaryApi = (data: IGetUnreadSummaryReq) => {
  return ajax<IGetUnreadSummaryRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/notification/getUnreadSummary`,
  })
}
