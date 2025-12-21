import type {
  IGetNotificationEventsByIdsReq,
  IGetNotificationEventsByIdsRes,
  IGetNotificationInboxByIdsReq,
  IGetNotificationInboxByIdsRes,
  IGetNotificationReadCursorsReq,
  IGetNotificationReadCursorsRes,
} from 'commonModule/type/ajax/notification'
import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

/**
 * @description: 按ID拉取通知事件明细
 */
export const getNotificationEventsByIdsApi = (data: IGetNotificationEventsByIdsReq) => {
  return ajax<IGetNotificationEventsByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/notification/getEventsByIds`,
  })
}

/**
 * @description: 按ID拉取通知收件箱明细
 */
export const getNotificationInboxByIdsApi = (data: IGetNotificationInboxByIdsReq) => {
  return ajax<IGetNotificationInboxByIdsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/notification/getInboxByIds`,
  })
}

/**
 * @description: 按分类拉取通知已读游标
 */
export const getNotificationReadCursorsApi = (data: IGetNotificationReadCursorsReq) => {
  return ajax<IGetNotificationReadCursorsRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/notification/getReadCursors`,
  })
}
