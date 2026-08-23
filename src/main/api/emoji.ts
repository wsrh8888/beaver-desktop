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

import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

// 类型定义
interface EmojiItem {
  emojiId: string
  userId: string
  emojiCode: string
  version: number
  createdAt: string
  updatedAt: string
}

interface EmojiPackageItem {
  packageId: string
  userId: string
  packageCode: string
  version: number
  createdAt: string
  updatedAt: string
}

interface EmojiPackage {
  id: number
  packageId: string
  title: string
  coverFile: string
  userId: string
  description: string
  type: string
  status: number
  version: number
  createdAt: string
  updatedAt: string
}

interface EmojiPackageContent {
  relationId: string
  packageId: string
  emojiId: string
  sortOrder: number
  version: number
  createdAt: string
  updatedAt: string
}

interface EmojiCollectsResponse { collects: EmojiItem[] }
interface EmojiPackageCollectsResponse { collects: EmojiPackageItem[] }
interface EmojiPackagesResponse { packages: EmojiPackage[] }
interface EmojiPackageContentsResponse { contents: EmojiPackageContent[] }

// 获取表情列表（通过ID列表）
export const getEmojisByIdsApi = (data: { ids: string[] }) => {
  return ajax({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/v1/getEmojisByUuids`,
  })
}

// 获取表情收藏列表（通过ID列表）
export const getEmojiCollectsByIdsApi = (data: { ids: string[] }) => {
  return ajax<EmojiCollectsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/v1/collects-by-ids`,
  })
}

// 获取表情包收藏列表（通过ID列表）
export const getEmojiPackageCollectsByIdsApi = (data: { ids: string[] }) => {
  return ajax<EmojiPackageCollectsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/v1/package-collects-by-ids`,
  })
}

// 获取表情包列表（通过ID列表）
export const getEmojiPackagesByIdsApi = (data: { ids: string[] }) => {
  return ajax<EmojiPackagesResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/v1/packages-by-ids`,
  })
}

// 获取表情包内容列表（通过表情包ID列表）
export const getEmojiPackageContentsByPackageIdsApi = (data: { packageIds: string[] }) => {
  return ajax<EmojiPackageContentsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/v1/package-contents-by-package-ids`,
  })
}

// 获取表情包内容列表（通过关联ID列表）
export const getEmojiPackageContentsByRelationIdsApi = (data: { relationIds: string[] }) => {
  return ajax<EmojiPackageContentsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/v1/package-contents-by-relation-ids`,
  })
}