/**
 * @description: 表情相关接口类型定义
 */

/**
 * @description: 表情项
 */
export interface IEmojiItem {
  emojiId: number;
  fileId: string;
  title: string;
  packageId?: number;
}

/**
 * @description: 表情包项
 */
export interface IEmojiPackageItem {
  packageId: number;
  title: string;
  coverFile: string;
  description: string;
  type: 'official' | 'user';
  collectCount: number;
  emojiCount: number;
  isCollected: boolean;
  isAuthor: boolean;
}

/**
 * @description: 表情分类项
 */
export interface IEmojiCategoryItem {
  categoryId: number;
  name: string;
  description: string;
  packageCount: number;
}

/**
 * @description: 表情
 */
export interface IEmoji {
  fileId: string;
  title: string;
}

/**
 * @description: 添加表情请求参数
 */
export interface IAddEmojiReq {
  fileId: string;
  title: string;
  packageId?: number;
}

/**
 * @description: 更新表情收藏状态请求参数
 */
export interface IUpdateFavoriteEmojiReq {
  emojiId: number;
  type: 'favorite' | 'unfavorite';
}

/**
 * @description: 获取表情列表请求参数
 */
export interface IGetEmojisListReq {
  page: number;
  size: number;
}

/**
 * @description: 获取表情列表响应
 */
export interface IGetEmojisListRes {
  count: number;
  list: IEmojiItem[];
}

/**
 * @description: 获取表情包列表请求参数
 */
export interface IGetEmojiPackagesReq {
  categoryId?: number;
  type?: 'official' | 'user';
  page: number;
  size: number;
}

/**
 * @description: 获取表情包列表响应
 */
export interface IGetEmojiPackagesRes {
  count: number;
  list: IEmojiPackageItem[];
}

/**
 * @description: 获取表情包详情请求参数
 */
export interface IGetEmojiPackageDetailReq {
  packageId: number;
}

/**
 * @description: 获取表情包详情响应
 */
export interface IGetEmojiPackageDetailRes extends IEmojiPackageItem {
  emojis: IEmojiItem[];
}

/**
 * @description: 更新表情包收藏状态请求参数
 */
export interface IUpdateFavoriteEmojiPackageReq {
  packageId: number;
  type: 'favorite' | 'unfavorite';
}

/**
 * @description: 创建表情包请求参数
 */
export interface ICreateEmojiPackageReq {
  title: string;
  coverFile: string;
  description: string;
}

/**
 * @description: 创建表情包响应
 */
export interface ICreateEmojiPackageRes {
  packageId: number;
}

/**
 * @description: 添加表情到表情包请求参数
 */
export interface IAddEmojiToPackageReq {
  packageId: number;
  fileId: string;
  title: string;
}

/**
 * @description: 添加表情到表情包响应
 */
export interface IAddEmojiToPackageRes {
  emojiId: number;
}

/**
 * @description: 从表情包中删除表情请求参数
 */
export interface IDeleteEmojiFromPackageReq {
  packageId: number;
  emojiId: number;
}

/**
 * @description: 批量添加表情到表情包请求参数
 */
export interface IBatchAddEmojiToPackageReq {
  packageId: number;
  emojis: IEmoji[];
}

/**
 * @description: 批量添加表情到表情包响应
 */
export interface IBatchAddEmojiToPackageRes {
  emojiIds: number[];
}

/**
 * @description: 获取用户收藏的表情包列表请求参数
 */
export interface IGetUserFavoritePackagesReq {
  page: number;
  size: number;
}

/**
 * @description: 获取用户收藏的表情包列表响应
 */
export interface IGetUserFavoritePackagesRes {
  count: number;
  list: IEmojiPackageItem[];
}
