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
}

export const useEmojiStore = defineStore('emojiStore', {
  state: () => ({
    defaultEmojis: emojiList as IEmojiBase[],
    favoriteEmojis: [] as IFavoriteEmoji[],
    packageList: [] as IEmojiPackageBase[],
    packageEmojisMap: {} as Record<string, IEmojiBase[]>,
  }),

  getters: {
    getPackageEmojis: (state) => {
      return (packageId: string) => state.packageEmojisMap[packageId] || []
    },
  },

  actions: {
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

      this.favoriteEmojis = favoriteRes?.list || []

      this.packageList = packageRes?.list || []
    },
    removeFavorite(emoji: IFavoriteEmoji) {
      if (!emoji) return
      this.favoriteEmojis = this.favoriteEmojis.filter((item) => {
        return item.emojiId !== emoji.emojiId
      })
    },
  },
})
