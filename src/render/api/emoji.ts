import type {
  IAddEmojiReq,
  IAddEmojiToPackageReq,
  IAddEmojiToPackageRes,
  IBatchAddEmojiToPackageReq,
  IBatchAddEmojiToPackageRes,
  ICommonRes,
  ICreateEmojiPackageReq,
  ICreateEmojiPackageRes,
  IDeleteEmojiFromPackageReq,
  IGetEmojiPackageDetailReq,
  IGetEmojiPackageDetailRes,
  IGetEmojiPackagesReq,
  IGetEmojiPackagesRes,
  IGetEmojisListReq,
  IGetEmojisListRes,
  IGetUserFavoritePackagesReq,
  IGetUserFavoritePackagesRes,
  IUpdateFavoriteEmojiPackageReq,
  IUpdateFavoriteEmojiReq,
  IGetEmojisByIdsReq,
  IGetEmojisByIdsRes,
  IGetEmojiPackagesByIdsReq,
  IGetEmojiPackagesByIdsRes,
  IGetEmojiCollectsByIdsReq,
  IGetEmojiCollectsByIdsRes,
  IGetEmojiPackageCollectsByIdsReq,
  IGetEmojiPackageCollectsByIdsRes,
  IGetEmojiPackageContentsByPackageIdsReq,
  IGetEmojiPackageContentsByPackageIdsRes,
} from 'commonModule/type/ajax/emoji'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 创建表情包
 */
export const createEmojiPackageApi = (data: ICreateEmojiPackageReq) => {
  return ajax<ICreateEmojiPackageRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packageCreate`,
    data,
  })
}

/**
 * @description: 添加表情到表情包
 */
export const addEmojiToPackageApi = (data: IAddEmojiToPackageReq) => {
  return ajax<IAddEmojiToPackageRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packageAddEmoji`,
    data,
  })
}

/**
 * @description: 从表情包中删除表情
 */
export const deleteEmojiFromPackageApi = (data: IDeleteEmojiFromPackageReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packageDeleteEmoji`,
    data,
  })
}

/**
 * @description: 批量添加表情到表情包
 */
export const batchAddEmojiToPackageApi = (data: IBatchAddEmojiToPackageReq) => {
  return ajax<IBatchAddEmojiToPackageRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packageBatchAdd`,
    data,
  })
}

/**
 * @description: 添加表情并自动收藏
 */
export const addEmojiApi = (data: IAddEmojiReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/add`,
    data,
  })
}

/**
 * @description: 收藏或取消收藏表情
 */
export const updateFavoriteEmojiApi = (data: IUpdateFavoriteEmojiReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/favoriteEmoji`,
    data,
  })
}

/**
 * @description: 获取用户收藏的表情列表
 */
export const getEmojisListApi = (data: IGetEmojisListReq) => {
  return ajax<IGetEmojisListRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/favoriteList`,
    data,
  })
}

/**
 * @description: 获取表情包列表
 */
export const getEmojiPackagesApi = (data: IGetEmojiPackagesReq) => {
  return ajax<IGetEmojiPackagesRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packageList`,
    data,
  })
}

/**
 * @description: 获取表情包详情
 */
export const getEmojiPackageDetailApi = (data: IGetEmojiPackageDetailReq) => {
  return ajax<IGetEmojiPackageDetailRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packageInfo`,
    data,
  })
}

/**
 * @description: 收藏或取消收藏表情包
 */
export const updateFavoriteEmojiPackageApi = (data: IUpdateFavoriteEmojiPackageReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packageFavorite`,
    data,
  })
}

/**
 * @description: 获取用户收藏的表情包列表
 */
export const getUserFavoritePackagesApi = (data: IGetUserFavoritePackagesReq) => {
  return ajax<IGetUserFavoritePackagesRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/favoritePackageList`,
    data,
  })
}

/**
 * @description: 批量获取表情详情
 */
export const getEmojisByIdsApi = (data: IGetEmojisByIdsReq) => {
  return ajax<IGetEmojisByIdsRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/emojis-by-ids`,
    data,
  })
}

/**
 * @description: 批量获取表情包详情
 */
export const getEmojiPackagesByIdsApi = (data: IGetEmojiPackagesByIdsReq) => {
  return ajax<IGetEmojiPackagesByIdsRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/packages-by-ids`,
    data,
  })
}

/**
 * @description: 批量获取用户收藏的表情记录详情（同步用）
 */
export const getEmojiCollectsByIdsApi = (data: IGetEmojiCollectsByIdsReq) => {
  return ajax<IGetEmojiCollectsByIdsRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/collects-by-ids`,
    data,
  })
}

/**
 * @description: 批量获取用户收藏的表情包记录详情（同步用）
 */
export const getEmojiPackageCollectsByIdsApi = (data: IGetEmojiPackageCollectsByIdsReq) => {
  return ajax<IGetEmojiPackageCollectsByIdsRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/package-collects-by-ids`,
    data,
  })
}

/**
 * @description: 批量获取表情包内容详情（同步用）
 */
export const getEmojiPackageContentsByPackageIdsApi = (data: IGetEmojiPackageContentsByPackageIdsReq) => {
  return ajax<IGetEmojiPackageContentsByPackageIdsRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/package-contents-by-package-ids`,
    data,
  })
}
