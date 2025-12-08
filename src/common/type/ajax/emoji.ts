/**
 * @description: 表情相关接口类型定义
 */

/**
 * @description: 表情项
 */
export interface IEmojiItem {
  emojiId: string
  fileKey: string
  title: string
  packageId?: string
}

/**
 * @description: 表情包项
 */
export interface IEmojiPackageItem {
  packageId: string
  title: string
  coverFile: string
  description: string
  type: 'official' | 'user'
  collectCount: number
  emojiCount: number
  isCollected: boolean
  isAuthor: boolean
}

/**
 * @description: 表情分类项
 */
export interface IEmojiCategoryItem {
  categoryId: number
  name: string
  description: string
  packageCount: number
}

/**
 * @description: 表情
 */
export interface IEmoji {
  fileKey: string
  title: string
}

/**
 * @description: 添加表情请求参数
 */
export interface IAddEmojiReq {
  fileKey: string
  title: string
  packageId?: string
}

/**
 * @description: 更新表情收藏状态请求参数
 */
export interface IUpdateFavoriteEmojiReq {
  emojiId: string
  type: 'favorite' | 'unfavorite'
}

/**
 * @description: 获取表情列表请求参数
 */
export interface IGetEmojisListReq {
  page: number
  size: number
}

/**
 * @description: 获取表情列表响应
 */
export interface IGetEmojisListRes {
  count: number
  list: IEmojiItem[]
}

/**
 * @description: 获取表情包列表请求参数
 */
export interface IGetEmojiPackagesReq {
  categoryId?: number
  type?: 'official' | 'user'
  page: number
  size: number
}

/**
 * @description: 获取表情包列表响应
 */
export interface IGetEmojiPackagesRes {
  count: number
  list: IEmojiPackageItem[]
}

/**
 * @description: 获取表情包详情请求参数
 */
export interface IGetEmojiPackageDetailReq {
  packageId: string
}

/**
 * @description: 获取表情包详情响应
 */
export interface IGetEmojiPackageDetailRes extends IEmojiPackageItem {
  emojis: IEmojiItem[]
}

/**
 * @description: 更新表情包收藏状态请求参数
 */
export interface IUpdateFavoriteEmojiPackageReq {
  packageId: string
  type: 'favorite' | 'unfavorite'
}

/**
 * @description: 创建表情包请求参数
 */
export interface ICreateEmojiPackageReq {
  title: string
  coverFile: string
  description: string
}

/**
 * @description: 创建表情包响应
 */
export interface ICreateEmojiPackageRes {
  packageId: string
}

/**
 * @description: 添加表情到表情包请求参数
 */
export interface IAddEmojiToPackageReq {
  packageId: string
  fileKey: string
  title: string
}

/**
 * @description: 添加表情到表情包响应
 */
export interface IAddEmojiToPackageRes {
  emojiId: string
}

/**
 * @description: 从表情包中删除表情请求参数
 */
export interface IDeleteEmojiFromPackageReq {
  packageId: string
  emojiId: string
}

/**
 * @description: 批量添加表情到表情包请求参数
 */
export interface IBatchAddEmojiToPackageReq {
  packageId: string
  emojis: IEmoji[]
}

/**
 * @description: 批量添加表情到表情包响应
 */
export interface IBatchAddEmojiToPackageRes {
  emojiIds: string[]
}

/**
 * @description: 获取用户收藏的表情包列表请求参数
 */
export interface IGetUserFavoritePackagesReq {
  page: number
  size: number
}

/**
 * @description: 获取用户收藏的表情包列表响应
 */
export interface IGetUserFavoritePackagesRes {
  count: number
  list: IEmojiPackageItem[]
}

// 通用响应类型
export interface ICommonRes {
  message: string
  success: boolean
}

/**
 * @description: 表情详情项
 */
export interface IEmojiDetailItem {
  emojiId: string
  collectId: string
  fileKey: string
  title: string
  status: number
  version: number
  packageId?: string
  createAt: number
  updateAt: number
}

/**
 * @description: 表情包详情项
 */
export interface IEmojiPackageDetailItem {
  packageId: string
  collectId: string
  title: string
  coverFile: string
  userId: string
  description: string
  type: string
  status: number
  collectCount: number
  createAt: number
  updateAt: number
  version: number
}

/**
 * @description: 表情收藏详情项
 */
export interface IEmojiCollectDetailItem {
  collectId: string
  userId: string
  emojiId: string
  isDeleted: boolean
  version: number
  createAt: number
  updateAt: number
}

/**
 * @description: 表情包收藏详情项
 */
export interface IEmojiPackageCollectDetailItem {
  collectId: string
  userId: string
  packageId: string
  isDeleted: boolean
  version: number
  createAt: number
  updateAt: number
}

/**
 * @description: 表情包内容详情项
 */
export interface IEmojiPackageContentDetailItem {
  packageId: string
  emojiId: string
  sortOrder: number
  version: number
  createAt: number
  updateAt: number
}

/**
 * @description: 批量获取表情详情请求参数
 */
export interface IGetEmojisByIdsReq {
  ids: string[]
}

/**
 * @description: 批量获取表情详情响应
 */
export interface IGetEmojisByIdsRes {
  emojis: IEmojiDetailItem[]
}

/**
 * @description: 批量获取表情包详情请求参数
 */
export interface IGetEmojiPackagesByIdsReq {
  ids: string[]
}

/**
 * @description: 批量获取表情包详情响应
 */
export interface IGetEmojiPackagesByIdsRes {
  packages: IEmojiPackageDetailItem[]
}

/**
 * @description: 批量获取表情收藏详情请求参数
 */
export interface IGetEmojiCollectsByIdsReq {
  ids: string[]
}

/**
 * @description: 批量获取表情收藏详情响应
 */
export interface IGetEmojiCollectsByIdsRes {
  collects: IEmojiCollectDetailItem[]
}

/**
 * @description: 批量获取表情包收藏详情请求参数
 */
export interface IGetEmojiPackageCollectsByIdsReq {
  ids: string[]
}

/**
 * @description: 批量获取表情包收藏详情响应
 */
export interface IGetEmojiPackageCollectsByIdsRes {
  collects: IEmojiPackageCollectDetailItem[]
}

/**
 * @description: 批量获取表情包内容详情请求参数
 */
export interface IGetEmojiPackageContentsByPackageIdsReq {
  packageIds: string[]
}

/**
 * @description: 批量获取表情包内容详情响应
 */
export interface IGetEmojiPackageContentsByPackageIdsRes {
  contents: IEmojiPackageContentDetailItem[]
}
