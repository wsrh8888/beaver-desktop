import { getBaseUrl } from 'commonModule/config'
import ajax from 'mainModule/utils/request/request'

// 类型定义
interface EmojiItem {
  uuid: string
  userId: string
  emojiId: number
  version: number
  createdAt: string
  updatedAt: string
}

interface EmojiPackageItem {
  uuid: string
  userId: string
  packageId: number
  version: number
  createdAt: string
  updatedAt: string
}

interface EmojiPackage {
  id: number
  uuid: string
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
  uuid: string
  packageId: number
  emojiId: number
  sortOrder: number
  version: number
  createdAt: string
  updatedAt: string
}

interface EmojiCollectsResponse {
  collects: EmojiItem[]
}

interface EmojiPackageCollectsResponse {
  collects: EmojiPackageItem[]
}

interface EmojiPackagesResponse {
  packages: EmojiPackage[]
}

interface EmojiPackageContentsResponse {
  contents: EmojiPackageContent[]
}

// 获取表情列表（通过UUID列表）
export const getEmojisByUuidsApi = (data: { uuids: string[] }) => {
  return ajax({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojisByUuids`,
  })
}

// 获取表情收藏列表（通过UUID列表）
export const getEmojiCollectsByUuidsApi = (data: { uuids: string[] }) => {
  return ajax<EmojiCollectsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojiCollectsByUuids`,
  })
}

// 获取表情包收藏列表（通过UUID列表）
export const getEmojiPackageCollectsByUuidsApi = (data: { uuids: string[] }) => {
  return ajax<EmojiPackageCollectsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojiPackageCollectsByUuids`,
  })
}

// 获取表情包列表（通过ID列表）
export const getEmojiPackagesByIdsApi = (data: { ids: string[] }) => {
  return ajax<EmojiPackagesResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojiPackagesByIds`,
  })
}

// 获取表情包内容列表（通过表情包UUID列表）
export const getEmojiPackageContentsByPackageIdsApi = (data: { packageIds: string[] }) => {
  return ajax<EmojiPackageContentsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojiPackageContentsByPackageIds`,
  })
}
