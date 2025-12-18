import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetEmojiPackageEmojisReq, IGetEmojiPackageEmojisRes, IGetEmojiPackagesByIdsReq, IGetEmojiPackagesByIdsRes, IGetEmojiPackagesRes, IGetEmojisListRes } from 'commonModule/type/ajax/emoji'
import { DataEmojiCommand } from 'commonModule/type/ipc/database'
import favoriteEmojiBusiness from 'mainModule/business/emoji/favorite-emoji'
import favoritePackageBusiness from 'mainModule/business/emoji/favorite-package'
import emojiPackageBusiness from 'mainModule/business/emoji/package'

class EmojiHandler {
  ensureLogin(header: ICommonHeader) {
    if (!header.userId) {
      throw new Error('用户未登录')
    }
  }

  async handle(
    _event: Electron.IpcMainInvokeEvent,
    command: DataEmojiCommand,
    data: IGetEmojiPackagesByIdsReq | IGetEmojiPackageEmojisReq,
    header: ICommonHeader,
  ): Promise<IGetEmojisListRes | IGetEmojiPackagesRes | IGetEmojiPackagesByIdsRes | IGetEmojiPackageEmojisRes> {
    this.ensureLogin(header)
    switch (command) {
      case DataEmojiCommand.GET_USER_FAVORITE_EMOJIS:
        return await favoriteEmojiBusiness.getUserFavoriteEmojis(header)
      case DataEmojiCommand.GET_EMOJI_PACKAGES:
        return await favoritePackageBusiness.getUserFavoritePackages(header)
      case DataEmojiCommand.GET_EMOJI_PACKAGES_BY_IDS:
        return await emojiPackageBusiness.getEmojiPackagesByIds(data as IGetEmojiPackagesByIdsReq)
      case DataEmojiCommand.GET_EMOJI_PACKAGE_EMOJIS:
        return await emojiPackageBusiness.getEmojiPackageEmojis(data as IGetEmojiPackageEmojisReq)
      default:
        console.error('未处理的表情命令:', command)
        throw new Error(`未处理的表情命令: EmojiHandler`)
    }
  }
}

export default new EmojiHandler()
