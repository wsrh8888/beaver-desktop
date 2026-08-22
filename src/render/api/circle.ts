import type {
  ICreateCircleReq,
  ICreateCircleRes,
  ICreateCommentReq,
  ICreateCommentRes,
  ICreatePostReq,
  ICreatePostRes,
  IDeleteCircleReq,
  IDeleteCircleRes,
  IDeleteCommentReq,
  IDeleteCommentRes,
  IGetCircleDetailReq,
  IGetCircleDetailRes,
  IGetCircleMembersReq,
  IGetCircleMembersRes,
  IGetCommentListReq,
  IGetCommentListRes,
  IGetMyCircleListReq,
  IGetMyCircleListRes,
  IGetPostDetailReq,
  IGetPostDetailRes,
  IGetPostLikesReq,
  IGetPostLikesRes,
  IGetPostListReq,
  IGetPostListRes,
  IInviteCircleMembersReq,
  IInviteCircleMembersRes,
  IJoinCircleReq,
  IJoinCircleRes,
  ILikePostReq,
  ILikePostRes,
  IQuitCircleReq,
  IQuitCircleRes,
  IRemoveCircleMembersReq,
  IRemoveCircleMembersRes,
  ISearchCircleReq,
  ISearchCircleRes,
  IUpdateCircleReq,
  IUpdateCircleRes,
  IResolveCircleInviteReq,
  IResolveCircleInviteRes,
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

export const updateCircleApi = (data: IUpdateCircleReq) => {
  return ajax<IUpdateCircleRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/circle/update`,
  })
}

export const joinCircleApi = (data: IJoinCircleReq) => {
  return ajax<IJoinCircleRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/circle/join`,
  })
}

export const quitCircleApi = (data: IQuitCircleReq) => {
  return ajax<IQuitCircleRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/circle/quit`,
  })
}

export const deleteCircleApi = (data: IDeleteCircleReq) => {
  return ajax<IDeleteCircleRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/circle/delete`,
  })
}

export const getCircleMembersApi = (data: IGetCircleMembersReq) => {
  return ajax<IGetCircleMembersRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/circle/members`,
  })
}

export const inviteCircleMembersApi = (data: IInviteCircleMembersReq) => {
  return ajax<IInviteCircleMembersRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/circle/invite`,
  })
}

export const removeCircleMembersApi = (data: IRemoveCircleMembersReq) => {
  return ajax<IRemoveCircleMembersRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/circle/member_remove`,
  })
}

export const getPostListApi = (data: IGetPostListReq) => {
  return ajax<IGetPostListRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/post/list`,
  })
}

export const getPostDetailApi = (data: IGetPostDetailReq) => {
  return ajax<IGetPostDetailRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/post/detail`,
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

export const getPostLikesApi = (data: IGetPostLikesReq) => {
  return ajax<IGetPostLikesRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/post/likes`,
  })
}

export const createCommentApi = (data: ICreateCommentReq) => {
  return ajax<ICreateCommentRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/circle/v1/comment/create`,
  })
}

export const getCommentListApi = (data: IGetCommentListReq) => {
  return ajax<IGetCommentListRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/comment/list`,
  })
}

export const deleteCommentApi = (data: IDeleteCommentReq) => {
  return ajax<IDeleteCommentRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/comment/delete`,
  })
}

export const resolveCircleInviteApi = (data: IResolveCircleInviteReq) => {
  return ajax<IResolveCircleInviteRes>({
    method: 'GET',
    params: data,
    url: `${baseUrl}/api/circle/v1/circle/invite_code`,
  })
}
