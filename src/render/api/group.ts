import { baseUrl } from "commonModule/config"
import { IGroupListRes } from "commonModule/type/ajax/group"
import { ajax } from "commonModule/utils/axios/request"

/**
 * @description: 创建群
 */
export const createGroupApi = (data) => {
  return ajax({
    method: 'POST',
    data: data,
    url: `${baseUrl}/api/group/create`
  })
}

/**
 * @description: 获取群列表
 */
export const getGroupListApi = () => {
  return ajax<IGroupListRes>({
    method: 'POST',
    url: `${baseUrl}/api/group/group_mine`
  })
}