/**
 * Copyright (c) 2024-2026 Beaver IM Team
 * SPDX-License-Identifier: MIT
 * Project: beaver-desktop
 * https://github.com/wsrh8888/beaver-desktop
 *
 * 中文：
 * 本文件为海狸 IM（Beaver IM）开源项目源代码。
 * 版权所有 © 2024-2026 Beaver IM Team，基于 MIT 协议授权。
 * 禁止删除、篡改或替换本文件头部版权与许可声明。
 * 使用与商业授权说明：https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * English:
 * This file is part of the Beaver IM open-source project.
 * Copyright (c) 2024-2026 Beaver IM Team. Licensed under the MIT License.
 * Do not remove, alter, or replace this copyright and license header.
 * Usage & commercial licensing: https://wsrh8888.github.io/beaver-docs/community/license.html
 *
 * beaver-desktop-header-v2
 */

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
  IGetEmojiCollectsByIdsReq,
  IGetEmojiCollectsByIdsRes,
  IGetEmojiPackageCollectsByIdsReq,
  IGetEmojiPackageCollectsByIdsRes,
  IGetEmojiPackageContentsByPackageIdsReq,
  IGetEmojiPackageContentsByPackageIdsRes,
  IGetEmojiPackageDetailReq,
  IGetEmojiPackageDetailRes,
  IGetEmojiPackagesByIdsReq,
  IGetEmojiPackagesByIdsRes,
  IGetEmojiPackagesReq,
  IGetEmojiPackagesRes,
  IGetEmojisByIdsReq,
  IGetEmojisByIdsRes,
  IGetEmojisListReq,
  IGetEmojisListRes,
  IGetUserFavoritePackagesReq,
  IGetUserFavoritePackagesRes,
  IUpdateFavoriteEmojiPackageReq,
  IUpdateFavoriteEmojiReq,
} from 'commonModule/type/ajax/emoji'
import { baseUrl } from 'commonModule/config'
import ajax from 'renderModule/utils/request/ajax'

/**
 * @description: 创建表情包
 */
export const createEmojiPackageApi = (data: ICreateEmojiPackageReq) => {
  return ajax<ICreateEmojiPackageRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/packageCreate`,
    data,
  })
}

/**
 * @description: 添加表情到表情包
 */
export const addEmojiToPackageApi = (data: IAddEmojiToPackageReq) => {
  return ajax<IAddEmojiToPackageRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/packageAddEmoji`,
    data,
  })
}

/**
 * @description: 从表情包中删除表情
 */
export const deleteEmojiFromPackageApi = (data: IDeleteEmojiFromPackageReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/packageDeleteEmoji`,
    data,
  })
}

/**
 * @description: 批量添加表情到表情包
 */
export const batchAddEmojiToPackageApi = (data: IBatchAddEmojiToPackageReq) => {
  return ajax<IBatchAddEmojiToPackageRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/packageBatchAdd`,
    data,
  })
}

/**
 * @description: 添加表情并自动收藏
 */
export const addEmojiApi = (data: IAddEmojiReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/add`,
    data,
  })
}

/**
 * @description: 收藏或取消收藏表情
 */
export const updateFavoriteEmojiApi = (data: IUpdateFavoriteEmojiReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/favoriteEmoji`,
    data,
  })
}

/**
 * @description: 获取用户收藏的表情列表
 */
export const getEmojisListApi = (data: IGetEmojisListReq) => {
  return ajax<IGetEmojisListRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/favoriteList`,
    data,
  })
}

/**
 * @description: 获取表情包列表
 */
export const getEmojiPackagesApi = (data: IGetEmojiPackagesReq) => {
  return ajax<IGetEmojiPackagesRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/packageList`,
    data,
  })
}

/**
 * @description: 获取表情包详情
 */
export const getEmojiPackageDetailApi = (data: IGetEmojiPackageDetailReq) => {
  return ajax<IGetEmojiPackageDetailRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/packageInfo`,
    data,
  })
}

/**
 * @description: 收藏或取消收藏表情包
 */
export const updateFavoriteEmojiPackageApi = (data: IUpdateFavoriteEmojiPackageReq) => {
  return ajax<ICommonRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/packageFavorite`,
    data,
  })
}

/**
 * @description: 获取用户收藏的表情包列表
 */
export const getUserFavoritePackagesApi = (data: IGetUserFavoritePackagesReq) => {
  return ajax<IGetUserFavoritePackagesRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/favoritePackageList`,
    data,
  })
}

/**
 * @description: 批量获取表情详情
 */
export const getEmojisByIdsApi = (data: IGetEmojisByIdsReq) => {
  return ajax<IGetEmojisByIdsRes>({
    method: 'POST',
    url: `${baseUrl}/api/emoji/v1/emojis-by-ids`,
    data,
  })
}
