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

import { defineStore } from 'pinia'
import { emojiList } from 'renderModule/windows/app/utils/emoji'

export interface IEmojiBase {
  emojiId: string
  name: string
  icon: string
  version?: number
}

export interface IEmojiPackageBase {
  packageId: string
  title: string
  coverFile: string
}

export interface IFavoriteEmoji {
  emojiId: string
  fileKey: string
  title: string
  packageId?: string
  emojiInfo?: {
    width: number
    height: number
  }
}

export const useEmojiStore = defineStore('emojiStore', {
  state: () => ({
    defaultEmojis: emojiList as IEmojiBase[],
    favoriteEmojis: [] as IFavoriteEmoji[],
    packageList: [] as IEmojiPackageBase[],
    packageEmojisMap: {} as Record<string, IEmojiBase[]>,
  }),

  getters: {
    getFavoriteEmojis: (state) => {
      return state.favoriteEmojis
    },
    getPackageEmojis: (state) => {
      return (packageId: string) => state.packageEmojisMap[packageId] || []
    },
  },

  actions: {
    async initPackageEmojis(packageId: string) {
      // 如果已经有数据，直接返回
      if (this.packageEmojisMap[packageId]) {
        return this.packageEmojisMap[packageId]
      }

      // 如果没有数据，从主进程获取
      try {
        const res = await electron.database.emoji.getEmojiPackageEmojis({
          packageId,
        })
        console.error('11111111111111111', res)
        console.error('11111111111', packageId)
        this.packageEmojisMap[packageId] = res?.list || []
        return this.packageEmojisMap[packageId]
      } catch (error) {
        console.error('Failed to load emoji package:', error)
        // 出错时返回空数组，避免UI崩溃
        this.packageEmojisMap[packageId] = []
        return []
      }
    },
    async init() {
      const [favoriteRes, packageRes] = await Promise.all([
        electron.database.emoji.getUserFavoriteEmojis({
          page: 1,
          size: 500,
        }),
        electron.database.emoji.getEmojiPackages({
          page: 1,
          size: 200,
        }),
      ])
      console.log('favorit111111111eRes', favoriteRes)
      console.log('22222222222222222222', packageRes)

      this.favoriteEmojis = favoriteRes?.list || []

      this.packageList = packageRes?.list || []
    },
    removeFavorite(emoji: IFavoriteEmoji) {
      if (!emoji)
        return
      this.favoriteEmojis = this.favoriteEmojis.filter((item) => {
        return item.emojiId !== emoji.emojiId
      })
    },

    /**
     * 处理表情基础数据更新通知
     */
    async handleEmojiUpdate(data: any) {
      console.log('处理表情基础数据更新:', data)
      // 这里可以触发表情数据的重新加载或更新
      // 例如重新获取表情包数据等
      // 如果需要重新加载表情包列表，可以调用相关方法
    },

    /**
     * 处理表情收藏更新通知
     */
    async handleEmojiCollectUpdate(data: any) {
      console.log('处理表情收藏更新:', data)
      // 重新加载用户收藏的表情列表
      await this.init()
    },

    /**
     * 处理表情包更新通知
     */
    async handleEmojiPackageUpdate(data: any) {
      console.log('处理表情包更新:', data)
      // 重新加载表情包列表
      const packageRes = await electron.database.emoji.getEmojiPackages({
        page: 1,
        size: 200,
      })
      this.packageList = packageRes?.list || []
    },

    /**
     * 处理表情包收藏更新通知
     */
    async handleEmojiPackageCollectUpdate(data: any) {
      console.log('处理表情包收藏更新:', data)
      // 重新加载表情包列表（如果收藏状态有变化）
      await this.handleEmojiPackageUpdate(data)
    },

    /**
     * 处理表情包内容更新通知
     */
    async handleEmojiPackageContentUpdate(data: any) {
      console.log('处理表情包内容更新:', data)
      // 这里可以根据更新的表情包ID来重新加载特定表情包的内容
      // 暂时重新加载所有表情包列表
      await this.handleEmojiPackageUpdate(data)
    },

  },
})
