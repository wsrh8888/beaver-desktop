import type {
  IAddFriendReq,
  IAddFriendRes,
  IDeleteFriendReq,
  IDeleteFriendRes,
  IFriendInfo,
  IFriendInfoReq,
  IFriendListReq,
  IFriendListRes,
  INoticeUpdateReq,
  INoticeUpdateRes,
  IResSearchUserInfo,
  ISearchUser,
  ISearchValidInfoReq,
  ISearchValidInfoRes,
  IValidListReq,
  IValidListRes,
  IValidStatusReq,
  IValidStatusRes,
} from 'commonModule/type/ajax/friend'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 获取好友列表
 */
export const getFriendListApi = (data: IFriendListReq) => {
  return ajax<IFriendListRes>({
    method: 'GET',
    data,
    url: `${baseUrl}/api/friend/friend_list`,
  })
}

/**
 * @description: 获取好友信息
 */
export const getFriendInfoApi = (data: IFriendInfoReq) => {
  console.log(data, '==-=')

  return ajax<IFriendInfo>({
    params: data,
    method: 'GET',
    url: `${baseUrl}/api/friend/friend_info`,
  })
}

/**
 * @description: 搜索好友（通过用户ID或邮箱）
 */
export const getSearchFriendApi = (data: ISearchUser) => {
  return ajax<IResSearchUserInfo>({
    method: 'GET',
    params: data, // 使用 params 而不是 data，因为是 GET 请求
    url: `${baseUrl}/api/friend/search`,
  })
}

/**
 * @description: 申请添加好友
 */
export const applyAddFriendApi = (data: IAddFriendReq) => {
  return ajax<IAddFriendRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/friend/add_friend`,
  })
}

/**
 * @description: 校验好友通过
 */
export const valiFrienddAPi = (data: IValidStatusReq) => {
  return ajax<IValidStatusRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/friend/valid`,
  })
}

/**
 * @description: 删除好友
 */
export const deleteFriendAPi = (data: IDeleteFriendReq) => {
  return ajax<IDeleteFriendRes>({
    data,
    method: 'DELETE',
    url: `${baseUrl}/api/friend/delete`,
  })
}

/**
 * @description: 修改好友备注
 */
export const updateRemarkNameApi = (data: INoticeUpdateReq) => {
  return ajax<INoticeUpdateRes>({
    data,
    method: 'POST',
    url: `${baseUrl}/api/friend/update_notice`,
  })
}

/**
 * @description: 获取好友验证请求列表
 */
export const getValidListApi = (data: IValidListReq) => {
  return ajax<IValidListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/friend/valid_list`,
  })
}

/**
 * @description: 查询好友验证记录
 */
export const searchValidInfoApi = (data: ISearchValidInfoReq) => {
  return ajax<ISearchValidInfoRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/friend/searchValidInfo`,
  })
}
