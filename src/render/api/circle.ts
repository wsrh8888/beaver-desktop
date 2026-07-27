import type {
  ICreateCircleReq,
  ICreateCircleRes,
  ICreatePostReq,
  ICreatePostRes,
  IGetCircleDetailReq,
  IGetCircleDetailRes,
  IGetMyCircleListReq,
  IGetMyCircleListRes,
  IGetPostListReq,
  IGetPostListRes,
  IJoinCircleReq,
  IJoinCircleRes,
  ILikePostReq,
  ILikePostRes,
  ISearchCircleReq,
  ISearchCircleRes,
} from 'commonModule/type/ajax/circle'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

export const getMyCircleListApi = (data: IGetMyCircleListReq) => {
  return ajax<IGetMyCircleListRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/circle/mine`,
  })
}

export const searchCircleApi = (data: ISearchCircleReq) => {
  return ajax<ISearchCircleRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/circle/search`,
  })
}

export const getCircleDetailApi = (data: IGetCircleDetailReq) => {
  return ajax<IGetCircleDetailRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/circle/detail`,
  })
}

export const createCircleApi = (data: ICreateCircleReq) => {
  return ajax<ICreateCircleRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/circle/create`,
  })
}

export const joinCircleApi = (data: IJoinCircleReq) => {
  return ajax<IJoinCircleRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/circle/join`,
  })
}

export const getPostListApi = (data: IGetPostListReq) => {
  return ajax<IGetPostListRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/post/list`,
  })
}

export const createPostApi = (data: ICreatePostReq) => {
  return ajax<ICreatePostRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/post/create`,
  })
}

export const likePostApi = (data: ILikePostReq) => {
  return ajax<ILikePostRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/post/like`,
  })
}
