import type {
  ICreateMomentCommentReq,
  ICreateMomentCommentRes,
  ICreateMomentReq,
  ICreateMomentRes,
  IDeleteMomentReq,
  IDeleteMomentRes,
  IGetMomentCommentsReq,
  IGetMomentCommentsRes,
  IGetMomentDetailReq,
  IGetMomentDetailRes,
  IGetMomentLikesReq,
  IGetMomentLikesRes,
  IGetMomentListReq,
  IGetMomentListRes,
  ILikeMomentReq,
  ILikeMomentRes,
} from 'commonModule/type/ajax/moment'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 创建朋友圈
 */
export const createMomentApi = (data: ICreateMomentReq) => {
  return ajax<ICreateMomentRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/moment/create`,
  })
}

/**
 * @description: 获取朋友圈列表
 */
export const getMomentListApi = (data: IGetMomentListReq) => {
  return ajax<IGetMomentListRes>({
    method: 'POST',
    data: {
      page: data.page,
      limit: data.limit,
    },
    url: `${baseUrl}/api/moment/list`,
  })
}

/**
 * @description: 点赞朋友圈
 */
export const likeMomentApi = (data: ILikeMomentReq) => {
  return ajax<ILikeMomentRes>({
    method: 'POST',
    data: {
      momentId: data.momentId,
      status: data.status,
    },
    url: `${baseUrl}/api/moment/like`,
  })
}

/**
 * @description: 发表评论
 */
export const createMomentCommentApi = (data: ICreateMomentCommentReq) => {
  return ajax<ICreateMomentCommentRes>({
    method: 'POST',
    data: {
      momentId: data.momentId,
      content: data.content,
      parentId: data.parentId,
      replyToCommentId: data.replyToCommentId,
    },
    url: `${baseUrl}/api/moment/comment/create`,
  })
}

/**
 * @description: 获取动态详情
 */
export const getMomentDetailApi = (data: IGetMomentDetailReq) => {
  return ajax<IGetMomentDetailRes>({
    method: 'POST',
    data: {
      momentId: data.momentId,
    },
    url: `${baseUrl}/api/moment/detail`,
  })
}

/**
 * @description: 删除朋友圈
 */
export const deleteMomentApi = (data: IDeleteMomentReq) => {
  return ajax<IDeleteMomentRes>({
    method: 'GET',
    data: {
      momentId: data.momentId,
    },
    url: `${baseUrl}/api/moment/delete`,
  })
}

/**
 * @description: 获取动态评论列表
 */
export const getMomentCommentsApi = (data: IGetMomentCommentsReq) => {
  return ajax<IGetMomentCommentsRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/moment/comments`,
  })
}

/**
 * @description: 获取顶层评论（含子回复预览3条）
 */
export const getMomentRootCommentsApi = (data: Omit<IGetMomentCommentsReq, 'parentId'>) => {
  return getMomentCommentsApi({
    ...data,
    parentId: undefined,
  })
}

/**
 * @description: 获取子评论（分页，不返回下级 children）
 */
export const getMomentChildCommentsApi = (
  data: IGetMomentCommentsReq & { parentId: string },
) => {
  return ajax<IGetMomentCommentsRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/moment/comments`,
  })
}

/**
 * @description: 获取动态点赞列表
 */
export const getMomentLikesApi = (data: IGetMomentLikesReq) => {
  return ajax<IGetMomentLikesRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/moment/likes`,
  })
}
