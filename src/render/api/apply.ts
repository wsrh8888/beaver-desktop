import { baseUrl } from "commonModule/config"
import { IValidListRes } from "commonModule/type/ajax/friend"
import { ajax } from "commonModule/utils/axios/request"

/**
 * @description: 获取好友校验列表
 */
export const getFriendValidListApi = (data) => {
  return ajax<IValidListRes>({
    method: 'POST',
    data,
    url: `${baseUrl}/api/friend/valid_list`
  })
}