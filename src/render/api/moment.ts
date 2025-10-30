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
    data,
    url: `${baseUrl}/api/moment/like`,
  })
}

/**
 * @description: 获取单个动态详情
 */
export const getMomentInfoApi = (data: IGetMomentInfoReq) => {
  return ajax<IGetMomentInfoRes>({
    method: 'GET',
    data,
    url: `${baseUrl}/api/moment/info`,
  })
}

/**
 * @description: 删除朋友圈
 */
export const deleteMomentApi = (data: IDeleteMomentReq) => {
  return ajax<IDeleteMomentRes>({
    method: 'GET',
    data,
    url: `${baseUrl}/api/moment/delete`,
  })
}
