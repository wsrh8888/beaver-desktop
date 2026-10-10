/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * beaver-desktop-header-v2
 */

/**
 * 朋友圈主进程 API。与渲染进程 api/moment.ts 同构，只是 ajax 从
 * @beaver-im/beaver/main 导入（实现由宿主 bind，token/deviceId 由宿主拦截器注入）。
 * 供 MCP server handler 调用，不在渲染进程重复实现。
 */
import type {
  ICreateMomentCommentReq,
  ICreateMomentCommentRes,
  ICreateMomentReq,
  ICreateMomentRes,
  IGetMomentDetailReq,
  IGetMomentDetailRes,
  IGetMomentListReq,
  IGetMomentListRes,
  ILikeMomentReq,
  ILikeMomentRes,
} from '../../common/type/ajax/moment'
import { ajax, getBaseUrl } from '@beaver-im/beaver/main'

/** 创建朋友圈 */
export const createMomentApi = (data: ICreateMomentReq) => {
  return ajax<ICreateMomentRes>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/moment/v1/create`,
  })
}

/** 获取朋友圈列表 */
export const getMomentListApi = (data: IGetMomentListReq) => {
  return ajax<IGetMomentListRes>({
    method: 'POST',
    data: { page: data.page, limit: data.limit },
    url: `${getBaseUrl()}/api/moment/v1/list`,
  })
}

/** 点赞朋友圈 */
export const likeMomentApi = (data: ILikeMomentReq) => {
  return ajax<ILikeMomentRes>({
    method: 'POST',
    data: { momentId: data.momentId, status: data.status },
    url: `${getBaseUrl()}/api/moment/v1/like`,
  })
}

/** 发表评论 */
export const createMomentCommentApi = (data: ICreateMomentCommentReq) => {
  return ajax<ICreateMomentCommentRes>({
    method: 'POST',
    data: {
      momentId: data.momentId,
      content: data.content,
      parentId: data.parentId,
      replyToCommentId: data.replyToCommentId,
    },
    url: `${getBaseUrl()}/api/moment/v1/comment/create`,
  })
}

/** 获取动态详情 */
export const getMomentDetailApi = (data: IGetMomentDetailReq) => {
  return ajax<IGetMomentDetailRes>({
    method: 'POST',
    data: { momentId: data.momentId },
    url: `${getBaseUrl()}/api/moment/v1/detail`,
  })
}
