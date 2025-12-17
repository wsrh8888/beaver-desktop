import type { ICommonHeader } from 'commonModule/type/ajax/common'
import type { IGetEmojiPackageEmojisReq, IGetEmojiPackageEmojisRes, IGetEmojiPackagesByIdsReq, IGetEmojiPackagesByIdsRes, IGetEmojiPackagesRes, IGetEmojisListRes } from 'commonModule/type/ajax/emoji'
import { DataEmojiCommand } from 'commonModule/type/ipc/database'
import { FavoriteEmojiBusiness } from 'mainModule/business/emoji/favorite-emoji'
import { FavoritePackageBusiness } from 'mainModule/business/emoji/favorite-package'
import { EmojiPackageBusiness } from 'mainModule/business/emoji/package'

export class EmojiHandler {
  static ensureLogin(header: ICommonHeader) {
    if (!header.userId) {
      throw new Error('用户未登录')
    }
  }

  static async handle(
    _event: Electron.IpcMainInvokeEvent,
    command: DataEmojiCommand,
    data: IGetEmojiPackagesByIdsReq | IGetEmojiPackageEmojisReq,
    header: ICommonHeader,
  ): Promise<IGetEmojisListRes | IGetEmojiPackagesRes | IGetEmojiPackagesByIdsRes | IGetEmojiPackageEmojisRes> {
    this.ensureLogin(header)
    const favoriteEmojiBiz = new FavoriteEmojiBusiness()
    const favoritePackageBiz = new FavoritePackageBusiness()
    const packageBiz = new EmojiPackageBusiness()
    switch (command) {
      case DataEmojiCommand.GET_USER_FAVORITE_EMOJIS:
        return await favoriteEmojiBiz.getUserFavoriteEmojis(header)
      case DataEmojiCommand.GET_EMOJI_PACKAGES:
        return await favoritePackageBiz.getUserFavoritePackages(header)
      case DataEmojiCommand.GET_EMOJI_PACKAGES_BY_IDS:
        return await packageBiz.getEmojiPackagesByIds(data as IGetEmojiPackagesByIdsReq)
      case DataEmojiCommand.GET_EMOJI_PACKAGE_EMOJIS:
        return await packageBiz.getEmojiPackageEmojis(data as IGetEmojiPackageEmojisReq)
      default:
        console.error('未处理的表情命令:', command)
        throw new Error(`未处理的表情命令: EmojiHandler`)
    }
  }
}
