import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetEmojisListRes } from 'commonModule/type/ajax/emoji'
import { EmojiCollectService } from 'mainModule/database/services/emoji/collect'
import { EmojiService } from 'mainModule/database/services/emoji/emoji'

const ensureLogin = (header: ICommonHeader) => {
  if (!header.userId) throw new Error('用户未登录')
}

export class FavoriteEmojiBusiness {
  async getUserFavoriteEmojis(header: ICommonHeader): Promise<IGetEmojisListRes> {
    ensureLogin(header)
    const collects = await EmojiCollectService.getCollectsByUserId(header.userId)
    const validCollects = collects.filter((item: any) => !item.isDeleted)
    const emojiIds = validCollects.map((item: any) => item.emojiId)
    const emojiMap = await EmojiService.getEmojisByUuids(emojiIds)

    const list = validCollects
      .map((item: any) => {
        const emoji = emojiMap.get(item.emojiId)
        if (!emoji) return null
        return {
          emojiId: emoji.uuid,
          fileKey: emoji.fileKey,
          title: emoji.title,
          packageId: undefined,
        }
      })
      .filter(Boolean) as IGetEmojisListRes['list']

    return { count: list.length, list }
  }
}
