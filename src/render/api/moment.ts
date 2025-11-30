import type {
  ICreateMomentReq,
  ICreateMomentRes,
  IDeleteMomentReq,
  IDeleteMomentRes,
  IGetMomentInfoReq,
  IGetMomentInfoRes,
  IGetMomentListReq,
  IGetMomentListRes,
  ILikeMomentReq,
  ILikeMomentRes,
  ICreateCommentReq,
  ICreateCommentRes,
  IDeleteCommentReq,
  IDeleteCommentRes,
  IGetCommentListReq,
  IGetCommentListRes,
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
    data,
    url: `${baseUrl}/api/moment/list`,
  })
}

/**
 * @description: 点赞朋友圈
 */
export const likeMomentApi = (data: ILikeMomentReq) => {
  return ajax<ILikeMomentRes>({
    method: 'POST',
    data: data,
    url: `${baseUrl}/api/moment/like`,
  })
}

/**
 * @description: 获取单个动态详情
 */
export const getMomentInfoApi = (data: IGetMomentInfoReq) => {
  return ajax<IGetMomentInfoRes>({
    method: 'GET',
    data: {
      momentId: data.momentId,
    },
    url: `${baseUrl}/api/moment/info`,
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
 * @description: 创建评论
 */
export const createCommentApi = (data: ICreateCommentReq) => {
  return ajax<ICreateCommentRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/moment/comment/create`,
  })
}

/**
 * @description: 获取评论列表
 */
export const getCommentListApi = (data: IGetCommentListReq) => {
  return ajax<IGetCommentListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/moment/comment/list`,
  })
}

/**
 * @description: 删除评论
 */
export const deleteCommentApi = (data: IDeleteCommentReq) => {
  return ajax<IDeleteCommentRes>({
    method: 'GET',
    data,
    url: `${baseUrl}/api/moment/comment/delete`,
  })
}
