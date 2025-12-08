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
    url: `${getBaseUrl()}/api/emoji/getEmojisByIds`,
  })
}

// 获取表情收藏列表（通过ID列表）
export const getEmojiCollectsByIdsApi = (data: { ids: string[] }) => {
  return ajax<EmojiCollectsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojiCollectsByIds`,
  })
}

// 获取表情包收藏列表（通过ID列表）
export const getEmojiPackageCollectsByIdsApi = (data: { ids: string[] }) => {
  return ajax<EmojiPackageCollectsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojiPackageCollectsByIds`,
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

// 获取表情包内容列表（通过表情包ID列表）
export const getEmojiPackageContentsByPackageIdsApi = (data: { packageIds: string[] }) => {
  return ajax<EmojiPackageContentsResponse>({
    method: 'POST',
    data,
    url: `${getBaseUrl()}/api/emoji/getEmojiPackageContentsByPackageIds`,
  })
}
