import { store } from 'mainModule/store'
import { getH5AuthCodeApi } from 'mainModule/api/oauth'

/**
 * 快捷登录 Logic 层
 * 对标 go-zero logic，负责业务逻辑
 */

export interface IQuickSignRes {
  authCode: string
  userinfo: {
    id: string
    name: string
    name_nick: string
    pic: string
  }
}

/**
 * 获取快捷登录签名（调用服务端生成 authCode）
 * @param appId - 应用ID
 * @returns [result, error] - 成功返回数据，失败返回错误信息
 */
export async function getQuickSign(appId: string): Promise<[IQuickSignRes | null, string | null]> {
  // 检查是否已登录
  const userInfo = store.get('userInfo')
  if (!userInfo || !userInfo.token) {
    return [null, '未登录']
  }

  // 获取用户详细信息
  const allUsers = store.get('allUser')
  const userDetail = allUsers?.[userInfo.userId]

  if (!userDetail) {
    return [null, '用户信息不存在']
  }

  // 调用服务端接口生成 authCode
  const res = await getH5AuthCodeApi({ appId })
  
  if (res.code !== 0 || !res.result?.authCode) {
    return [null, res.msg || '生成 authCode 失败']
  }

  return [
    {
      authCode: res.result.authCode,
      userinfo: {
        userId: userInfo.userId,
        name: userDetail.nickName || '',
        name_nick: userDetail.nickName || '',
        pic: userDetail.avatar || '',
      },
    },
    null,
  ]
}
